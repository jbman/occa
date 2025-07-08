function decode(jwt) {
  if (!jwt) {
    return "Error: No token available";
  }
  let parts = jwt.split(".");
  if (parts.length !== 3) {
    return "Error: Not a JWT, expected three parts separated by a dot.";
  }
  let header = JSON.parse(base64UrlDecode(parts[0]));
  let claims = JSON.parse(base64UrlDecode(parts[1]));
  return { header: header, claims: claims };
}

function base64UrlDecode(input) {
  // Based on https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
  // Replace replace "-" with "+" and "_" with "/"
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

export default {
  decode: decode
};
