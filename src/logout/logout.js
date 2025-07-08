var logoutButtonElement;

function init(logoutEndpoint, idTokenProviderFn, onLogout) {
  logoutButtonElement = document.getElementById("logoutButton");
  logoutButtonElement.onclick = function () {
    if (!logoutEndpoint || logoutEndpoint.length === 0) {
      alert("No logout endpoint configured.");
      return;
    }
    const postLogoutRedirectUri = window.location.origin + "/";

    let endSessionUrl = _buildEndSessionUrl(
      logoutEndpoint,
      idTokenProviderFn(),
      postLogoutRedirectUri
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
  postLogoutRedirectUri
) {
  return `${logoutEndpoint}?id_token_hint=${idTokenEncoded}&post_logout_redirect_uri=${postLogoutRedirectUri}`;
}

export default {
  init,
  onLogin
};
