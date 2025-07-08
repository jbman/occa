// Based on code from https://github.com/curityio/pkce-javascript-example which is publichsed under Apache 2.0 License

const method = crypto.subtle ? "S256" : "plain";
_warnIfNoCrypto();

function challengeMethod() {
  return method;
}

async function generateCodeChallenge(codeVerifier) {
  if (method === "S256") {
    var digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(codeVerifier)
    );

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }
  if (method === "plain") {
    return codeVerifier;
  }
}

function generateRandomString(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function _warnIfNoCrypto() {
  if (!crypto.subtle) {
    console.warn(
      "<p>" +
        "<b>WARNING:</b> The script will fall back to using plain code challenge as crypto is not available.</p>" +
        '<p>Javascript crypto services require that this site is served in a <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts">secure context</a>; ' +
        "either from <b>(*.)localhost</b> or via <b>https</b>. </p>" +
        '<p> You can add an entry to /etc/hosts like "127.0.0.1 public-test-client.localhost" and reload the site from there, enable SSL using something like <a href="https://letsencrypt.org/">letsencypt</a>, or refer to this <a href="https://stackoverflow.com/questions/46468104/how-to-use-subtlecrypto-in-chrome-window-crypto-subtle-is-undefined">stackoverflow article</a> for more alternatives.</p>' +
        "<p>If Javascript crypto is available this message will disappear.</p>"
    );
  }
}

export default {
  challengeMethod: challengeMethod,
  generateCodeChallenge: generateCodeChallenge,
  generateRandomString: generateRandomString
};
