var refreshButtonElement;

// Init method to find the HTML element which triggers the refresh and handle the click.
function init(config, onResponse, onError) {
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
