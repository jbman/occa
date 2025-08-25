var refreshButtonElement;

/** 
* Configure the element which refreshes the token-
*
* @param {Object} refreshConfig - The refresh action configuration
* @param {Object} refreshConfig.config - Values for the the refresh request
* @param {Object} refreshConfig.config.clientId - The client ID for the refresh request
* @param {Object} refreshConfig.config.tokenEndpoint - The token endpoint for the refresh request
* @param {function} refreshConfig.onResponse - The function executed after a successful refresh request. It gets the token response as input param.
* @param {function} refreshConfig.onError -  The function executed after an error from the token endpoint.
*/
function init({config, onResponse, onError}) {
  refreshButtonElement = document.getElementById("refreshButton");
  refreshButtonElement.onclick = function () {
    _refreshRequest(config, onResponse, onError);
  };
}

function _showButton() {
  refreshButtonElement.hidden = false;
}

function tokenReceived(refreshToken) {
  _showButton();
  window.sessionStorage.setItem("refreshToken", refreshToken);
}

// To be called when logout is perfromed. Discards the refrehs token.
function onLogout() {
  window.sessionStorage.removeItem("refreshToken");
}

function _refreshRequest(config, onResponse, onError) {
  let refreshToken = window.sessionStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.warn("No refresh token available");
    return;
  }

  // Build and send refresh token request
  // https://www.oauth.com/oauth2-servers/making-authenticated-requests/refreshing-an-access-token/
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      onResponse(xhr.response);
    } else {
      onError(xhr.reponse);
    }
  };
  xhr.responseType = "json";
  xhr.open("POST", config.tokenEndpoint, true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(
    new URLSearchParams({
      client_id: config.clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  );
}

export default {
  init,
  tokenReceived,
  onLogout,
};
