var logoutButtonElement;

/**
 * Configure the element which executes the logout.
 *
 * @param {Object} logoutConfig - the logout configuration
 * @param {string} postLogoutRedirectUri - The URI to be opened after logout.
 * @param {string} logoutConfig.logoutEndpoint - The endpoint where the user is send for logout
 * @param {function} logoutConfig.idTokenProviderFn - The provider of the ID token for the logout request.
 * @param {function} logoutConfig -  A callback function which gets executed before navigating to the logout endpoint.
 */
function init({
  logoutEndpoint,
  postLogoutRedirectUri,
  idTokenProviderFn,
  onLogout,
}) {
  logoutButtonElement = document.getElementById("logoutButton");
  logoutButtonElement.onclick = function () {
    if (!logoutEndpoint || logoutEndpoint.length === 0) {
      alert("No logout endpoint configured.");
      return;
    }
    let endSessionUrl = _buildEndSessionUrl(
      logoutEndpoint,
      idTokenProviderFn(),
      postLogoutRedirectUri,
    );
    onLogout();
    // Navigate to Logout endpoint of IdP
    window.location = endSessionUrl;
  };
}

// To be called on successful login to show the logout button
function onLogin() {
  logoutButtonElement.hidden = false;
}

function _buildEndSessionUrl(
  logoutEndpoint,
  idTokenEncoded,
  postLogoutRedirectUri,
) {
  return `${logoutEndpoint}?id_token_hint=${idTokenEncoded}&post_logout_redirect_uri=${postLogoutRedirectUri}`;
}

export default {
  init,
  onLogin,
};
