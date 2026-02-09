import AuthRequest from "./util/authRequest";
import ClientUrl from "./util/clientUrl";
import Render from "./util/render";
import Config from "./util/config";
import BrokeredToken from "./keycloak/brokeredToken";
import IdTokenStore from "./util/idTokenStore";
import Logout from "./logout/logout";
import Refresh from "./refresh/refresh";
import Userinfo from "./userinfo/userinfo";
import Discovery from "./util/discovery";
import ClientRegistration from "./register/clientRegistrationRequests";
import DPoPJwtGenerator from "./dpop/dpopJwtGenerator";
import KeyPairGenerator from "./dpop/keyPairGenerator";

async function main() {
  const { keyPair, publicJwk } =
    await KeyPairGenerator.generateRS256KeyPairForDPoP();

  const defaultConfig = {
    clientId: "occa",
    discoveryEndpoint:
      "https://example.com/auth/realms/master/.well-known/openid-configuration",
    authorizationEndpoint: "",
    tokenEndpoint: "",
    logoutEndpoint: "",
    userinfoEndpoint: "",
    scope: "openid",
    authParams: "",
    dpopEnabled: false,
  };

  const ELEMENTS = {
    resetNotification: "resetNotification",
    loadDiscoveryNotification: "loadDiscoveryNotification",
    refreshNotification: "refreshNotification",
    userInfoNotification: "userInfoNotification",
    loginNotification: "loginNotification",
  };

  const redirectUri = ClientUrl.resolveRedirctUri(window.location.href);
  // Remove trailing slash to get the root URL
  const rootUrl = redirectUri.slice(0, redirectUri.length - 1);

  // Render redirectUri
  document.getElementById("redirectUri").innerHTML = redirectUri;

  // Button to reset config
  document.getElementById("resetConfig").onclick = function () {
    config = Config.reset(defaultConfig);
    Render.notifySuccess(
      "Configuration reset done.",
      ELEMENTS.resetNotification,
    );
  };

  // Load config from session storage
  let config = Config.load(defaultConfig);
  // Merge parameters from URL into config
  config = Config.readFromUrl(
    config,
    new URLSearchParams(window.location.search).entries(),
  );
  Render.renderConfig(config, Config.createConfigLink(rootUrl, config));

  // Checkbox for DPoP request
  const checkbox = document.getElementById("dpopEnabled");

  checkbox.addEventListener("change", () => {
    Config.storeInputValues(config, "dpopEnabled", !!checkbox.checked);
  });

  // Configure button which starts auth flow
  document.getElementById("startButton").onclick = function () {
    // Store current values for next login
    Config.storeInputValues(config);
    // Navigate to the login page
    AuthRequest.startLogin(redirectUri, config);
  };

  // When a token response is received, this function is called to render the response
  // and provide the reposne to other UI modules.
  const handleTokenResponse = function (response) {
    Render.renderAuthResponse(response);
    IdTokenStore.store(response.id_token);
    Refresh.tokenReceived(response.refresh_token, response.access_token);
    Logout.onLogin();
    Userinfo.onLogin(response.access_token);
    DPoPJwtGenerator.onLogin(response.access_token);
  };

  // When the token request results in an error, this function is called to render the error
  const handleTokenError = function (response) {
    Render.notifyError(
      `Error requsting token at token endpoint ${config.tokenEndpoint}: ${response.error} - ${response.error_description}`,
      ELEMENTS.loginNotification,
    );
  };

  // Render client registration requests
  ClientRegistration.render({
    rootUrl: rootUrl,
    redirectUri: redirectUri,
    clientId: config.clientId,
  });

  // Initialize "Load Discovery document" functionality and handle discovery doeument response
  Discovery.init({
    onResponse: (discoveryEndpointUrl, discoveryJSON) => {
      config = Config.writeInputElements({
        // ...config, // Merge discovery values into existing persisted config incl. client ID or scope (reset to default this way)
        ...Config.readInputElements(config),
        discoveryEndpoint: discoveryEndpointUrl, // Persist URL from input
        authorizationEndpoint: discoveryJSON.authorization_endpoint,
        tokenEndpoint: discoveryJSON.token_endpoint,
        userinfoEndpoint: discoveryJSON.userinfo_endpoint,
        logoutEndpoint: discoveryJSON.end_session_endpoint,
      });
      Render.renderConfig(config);
      Render.renderConfig(config, Config.createConfigLink(rootUrl, config));
      Render.notifySuccess(
        `Endpoints updated from discovery document ${discoveryEndpointUrl}.`,
        ELEMENTS.loadDiscoveryNotification,
      );
    },
    onError: (discoveryEndpointUrl, errorMessage) => {
      Render.notifyError(
        `Error response from ${discoveryEndpointUrl}: ${errorMessage}`,
        ELEMENTS.loadDiscoveryNotification,
      );
    },
  });
  // Load automatically, so that "Start login" could be used right away.
  Discovery.load();

  // Initialize Refresh functionality
  Refresh.init({
    config: config,
    onResponse: (response) => {
      handleTokenResponse(response);
      Render.notifySuccess(
        "Refresh complete, tokens updated.",
        ELEMENTS.refreshNotification,
      );
    },
    onError: handleTokenError,
    keyPair: keyPair,
    publicJwk: publicJwk,
  });

  // Initialize Logout functionality
  Logout.init({
    logoutEndpoint: config.logoutEndpoint,
    postLogoutRedirectUri: rootUrl,
    idTokenProviderFn: () => {
      return IdTokenStore.get();
    },
    onLogout: () => {
      Refresh.onLogout();
      IdTokenStore.discard();
    },
  });

  Userinfo.init({
    config: config,
    onResponse: (response) => {
      Render.renderUserInfo(response);
      Render.notifySuccess("User Info updated.", ELEMENTS.userInfoNotification);
    },
    onError: (response) => {
      console.log("Error from userinfo endpoint: " + response);
      Render.notifyError(
        `Error from userinfo endpoint`,
        ELEMENTS.userInfoNotification,
      );
    },
    keyPair: keyPair,
    publicJwk: publicJwk,
  });

  // Check if code is provided on callback from auth server at "/code" or
  const args = new URLSearchParams(window.location.search);
  const code = args.get("code");
  if (code) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var response = xhr.response;
      if (xhr.status === 200) {
        handleTokenResponse(response);
        Render.notifySuccess(
          "Login successful, tokens retrieved.",
          ELEMENTS.loginNotification,
        );
        BrokeredToken.fetchIdpIdToken(response.access_token, response.id_token);
      } else {
        handleTokenError(response);
      }
      // Remove query paremters (code and session_state) and set this as new browser location.
      const newUrl = new URL(window.location);
      newUrl.search = "";
      history.pushState("", document.title, newUrl);
      // Jump to Request and Response section
      window.location.hash = "#request";
    };
    xhr.responseType = "json";
    const httpMethod = "POST";
    const tokenEndpoint = config.tokenEndpoint;
    xhr.open(httpMethod, tokenEndpoint, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    if (config.dpopEnabled) {
      const dpop = await DPoPJwtGenerator.generateDpopJwt(
        httpMethod,
        tokenEndpoint,
        keyPair,
        publicJwk,
        null,
        null,
      );
      xhr.setRequestHeader("DPoP", dpop);
    }

    xhr.send(
      new URLSearchParams({
        client_id: config.clientId,
        code_verifier: window.sessionStorage.getItem("code_verifier"),
        grant_type: "authorization_code",
        redirect_uri: location.href.replace(location.search, ""),
        code: code,
      }),
    );
  }

  // Check if error_description is provided as URL parameter by authorization server and show it
  const error = args.get("error");
  if (error) {
    const errorDescription =
      args.get("error_description") || "- No description provided - ";
    Render.notifyError(
      `Error ${error} on login: ${errorDescription}`,
      ELEMENTS.loginNotification,
    );
  }
}

main();
