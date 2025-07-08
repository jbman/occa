let discoveryButtonElement;
let discoveryEndpointElement;

function init(onResponse, onError) {
  discoveryButtonElement = document.getElementById("discoveryButton");
  discoveryEndpointElement = document.getElementById("discoveryEndpoint");
  discoveryButtonElement.onclick = function () {
    _discoveryRequest(discoveryEndpointElement.value, onResponse, onError);
  };
}

function load() {
  discoveryButtonElement = document.getElementById("discoveryButton");
  discoveryButtonElement.click();
}

function _discoveryRequest(discoveryEndpointUrl, onResponse, onError) {
  // Fetch discovery document (https://openid.net/specs/openid-connect-discovery-1_0.html)
  window.fetch(discoveryEndpointUrl)
    .then(async (response) => {
      if (response.ok) {
        onResponse(discoveryEndpointUrl, await response.json()); 
      }
      else {
        console.log("Error loading discovery document: " + response.status);
        onError(discoveryEndpointUrl, response.status);
      }

    })
    .catch ((error) => {
      onError(discoveryEndpointUrl, error);
    });
}

export default {
  init,
  load,
};
