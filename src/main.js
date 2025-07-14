import PKCE from "./util/pkce";
import Render from "./util/render";
import Config from "./util/config";
import BrokeredToken from "./keycloak/brokeredToken";
import IdTokenStore from "./util/idTokenStore";
import Logout from "./logout/logout";
import Refresh from "./refresh/refresh";
import Userinfo from "./userinfo/userinfo";
import Discovery from "./util/discovery";
import OpenRedirect from "./vulnerabilities/openRedirect";

const defaultConfig = {
  clientId: "occa",
  discoveryEndpoint: "https://example.com/auth/realms/master/.well-known/openid-configuration",
  authorizationEndpoint: "",
  tokenEndpoint: "",
  logoutEndpoint: "",
  userinfoEndpoint: "",
  scope: "openid",
  authParams: "",
};

// Redirection URI is same as application URL, but reomve nya parameters and hash (#) and append slash if missing
const redirectURL = new URL(window.location.href);
redirectURL.hash = '';
redirectURL.search = '';
redirectURL.pathname = redirectURL.pathname + (redirectURL.pathname.endsWith('/') ? "": "/");
const redirectUri = redirectURL.href;

// Render redirectUri
document.getElementById("redirectUri").innerHTML = redirectUri;

// Button to start auth flow
document.getElementById("startButton").onclick = function () {
  Config.storeInputValues(config);

  var codeVerifier = PKCE.generateRandomString(64);

  Promise.resolve()
    .then(() => {
      return PKCE.generateCodeChallenge(codeVerifier);
    })
    .then(function (codeChallenge) {
      window.sessionStorage.setItem("code_verifier", codeVerifier);

      const args = new URLSearchParams({
        response_type: "code",
        client_id: config.clientId,
        code_challenge_method: PKCE.challengeMethod(),
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
        scope: config.scope,
      });
      let newLocation = config.authorizationEndpoint + "/?" + args;
      // Add additional parameters if any
      if (config.authParams != null && config.authParams.trim() !== "") {
        newLocation += "&" + config.authParams;
      }
      console.log(
        "Set new location to start authorization flow: " + newLocation
      );
      window.location = newLocation;
    });
};

// Button to reset config
document.getElementById("resetConfig").onclick = function () {
  config = Config.reset(defaultConfig);
  Render.notifySuccess('Configuration reset done.');
};

// Load config from session storage
let config = Config.load(defaultConfig);
// Merge parameters from URL into config
config = Config.readFromUrl(config, new URLSearchParams(window.location.search).entries());

// When a token response is received, this function is called to render the response
// and provide the reposne to other UI modules.
const handleTokenResponse = function (response) {
  Render.renderAuthResponse(response);
  IdTokenStore.store(response.id_token);
  Refresh.tokenReceived(response.refresh_token);
  Logout.onLogin();
  Userinfo.onLogin(response.access_token);
};

// When the token request results in an error, this function is called to render the error
const handleTokenError = function (response) {
  Render.renderLoginError(
    "Error requsting token",
    response && response.error
      ? `${response.error}: ${response.error_description}`
      : `Token endpoint ${config.tokenEndpoint} returned ${xhr.status} ${xhr.statusText}`
  );
};

// Initialize "Load Discovery document" functionality and handle discovery doeument response
Discovery.init(
  (discoveryEndpointUrl, discoveryJSON) => {
  config = Config.writeInputElements({
      // ...config, // Merge discovery values into existing persisted config incl. client ID or scope (reset to default this way)
      ...Config.readInputElements(config),
      discoveryEndpoint: discoveryEndpointUrl, // Persist URL from input
      authorizationEndpoint: discoveryJSON.authorization_endpoint,
      tokenEndpoint: discoveryJSON.token_endpoint,
      userinfoEndpoint: discoveryJSON.userinfo_endpoint,
      logoutEndpoint: discoveryJSON.end_session_endpoint,
    });
    Render.notifySuccess(`Endpoints updated from discovery document ${discoveryEndpointUrl}.`);
  },
  (discoveryEndpointUrl, errorMessage) => {
    Render.notifyError(`Error response from ${discoveryEndpointUrl}: ${errorMessage}`);
  }
);
// Load automatically, so that "Start login" could be used right away.
Discovery.load();

// Initialize Refresh functionality
Refresh.init(
  config, 
  (response) => { handleTokenResponse(response); Render.notifySuccess("Refresh complete, tokens updated."); },
  handleTokenError
);

// Initialize Logout functionality
Logout.init(
  config.logoutEndpoint,
  () => {
    return IdTokenStore.get();
  },
  () => {
    Refresh.onLogout();
    IdTokenStore.discard();
  }
);

Userinfo.init(
  config,
  (response) => {
    Render.renderUserInfo(response);
    Render.notifySuccess("User Info updated.");    
  },
  (response) => {
    console.log("Error from userinfo endpoint: " + response);
  }
);


// Check if code is provided on callback from auth server at "/code" or 
const args = new URLSearchParams(window.location.search);
const code = args.get("code");
if (code) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var response = xhr.response;
    if (xhr.status === 200) {
      handleTokenResponse(response);
      Render.notifySuccess("Login successful, tokens retrieved.");
      BrokeredToken.fetchIdpIdToken(response.access_token, response.id_token);
    } else {
      handleTokenError(response);
    }
    // Set navigation state to top-level URL without URL params
    history.pushState("", document.title, window.location.origin);
  };
  xhr.responseType = "json";
  xhr.open("POST", config.tokenEndpoint, true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(
    new URLSearchParams({
      client_id: config.clientId,
      code_verifier: window.sessionStorage.getItem("code_verifier"),
      grant_type: "authorization_code",
      redirect_uri: location.href.replace(location.search, ""),
      code: code,
    })
  );
  // Dsiplay error_description if provided as URL parameter by authorization server.
  let errorDescription = args.get("error_description");
  if (errorDescription) {
    Render.renderLoginError("Error on login", errorDescription);
  }
}
