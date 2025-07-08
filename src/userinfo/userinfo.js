var userinfoButtonElement;
var accessToken;

// Init method to find the HTML element which triggers the userinfo request.
function init(config, onResponse, onError) {
  userinfoButtonElement = document.getElementById("userinfoButton");
  userinfoButtonElement.onclick = function () {
    _userinfoRequest(config.userinfoEndpoint, onResponse, onError);
  };
}

function onLogin(accessTokenJwt) {
  userinfoButtonElement.hidden = false;
  accessToken = accessTokenJwt;
}

function _userinfoRequest(userInfoEndpoint, onResponse, onError) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      onResponse(xhr.response);
    } else {
      onError(xhr.reponse);
    }
  };
  xhr.responseType = "json";
  xhr.open("GET", userInfoEndpoint, true);
  xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
  xhr.send();
}

export default {
  init,
  onLogin,
};
