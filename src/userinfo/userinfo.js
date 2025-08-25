var userinfoButtonElement;
var accessToken;

/**
 * Configure the element which requests OpenID Connect userinfo.
 * 
 * @param {Object} userinfoConfig - The userinfo action configuration
 * @param {Object} userinfoConfig.config - Values for the the userinfo request
 * @param {Object} userinfoConfig.config.userinfoEndpoint - The endpoint to request the userinfo object.
 * @param {function} userinfoConfig.onResponse - The function executed after a successful userinfo request. It gets the userinfo object as input param.
 * @param {function} userinfoConfig.onError -  The function executed after an error from the userinfo endpoint.
 */
function init({config, onResponse, onError}) {
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
