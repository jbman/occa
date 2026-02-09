import PKCE from "./pkce";

/**
 * Build the authorization request and open this URL.
 *
 * @param {string} redirectUri - The redirect URI to be used.
 * @param {Object} config - The application config.
 */
function startLogin(redirectUri, config) {
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
        "Set new location to start authorization flow: " + newLocation,
      );
      window.location = newLocation;
    });
}

export default {
  startLogin,
};
