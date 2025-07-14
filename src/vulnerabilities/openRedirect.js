// This forward feature introduces an open redirect into the application.
//
// Redirect URI which forwards the code to example.com: https://occa.app/forward?url=https://example.com
// 
// This URL must be encoded and used as redirect URI in the authorizaton request:
// ?response_type=code&client_id=occa&redirect_uri=https%3A%2F%2Focca.app%2Fforward%3Furl%3Dhttps%3A%2F%2Fexample.com

// Tries to find an URL parameter in the current location and forwards to this URL.
// All URL parameters and the hash are passed to the given URL.
function forward(window) {
    var args = new URLSearchParams(window.location.search);
    var urlParam = args.get("url");
    if(!urlParam) {
      console.log('Forward route expects parameter "url"')
    }
    else {
      const forwardUrl = new URL(urlParam);
      forwardUrl.search = window.location.search;
      forwardUrl.hash = window.location.hash;
      // Display a confirmation (aceeptable trade-off if you need an open redirect in your application)
      if (window.confirm(`Open redirect notice \n\nThis page is sending you to an other page and forwards all URL paramaters and the hash:\n\n${forwardUrl.hostname}\n\nBy clicking OK you risk that your tokens are hijacked. \nClick Cancel to stay safe.`)) {
        window.location = forwardUrl.href;
      }
    }

}

// Execute the forward
forward(window);


  