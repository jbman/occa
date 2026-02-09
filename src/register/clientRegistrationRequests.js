function setInnerHtml(elementId, value) {
  document.getElementById(elementId).innerHTML = value;
}

function render(data) {
  // Configure client manually at Keycloak
  setInnerHtml(
    "configureClientManually",
    `<ul>
    <li>Client ID: ${data.clientId}</li>
    <li>Redirect URI: ${data.redirectUri}</li> 
    <li>Allowed web origins for cross-origin requests: ${data.rootUrl}</li>
    <li><i>Authorization Code Flow</i> enabled<br/>
      See OAuth 2.0 RFC 6749 section 4.1 or OpenID Connect Core 1.0 section 3.1
    </li>
    <li><i>PKCE</i> enabled with Code Challenge method <i>SHA256</i></li>
  </ul>`,
  );

  // Keycloak Client registration
  setInnerHtml(
    "keycloakCurlRequest",
    `curl --request POST \\
  --url http://localhost:8080/realms/my-realm/clients-registrations/default \\
  --header 'authorization: Bearer <your initial access token>' \\
  --header 'content-type: application/json' \\
  --data '{ 
  "clientId": "${data.clientId}",
  "publicClient": true,
  "rootUrl": "${data.rootUrl}",
  "redirectUris": ["/"],
  "webOrigins": ["+"],
  "attributes": {
      "post.logout.redirect.uris": "/"
      }
  }'`,
  );

  // Standard OAuth 2.0 Client registration with policy
  setInnerHtml(
    "keycloakTrustedHostsRegistrationPolicy",
    `<ul>
  <li>Trusted Hosts: ${new URL(data.rootUrl).host}</li>
  <li>Host Sending Client Registration Request Must Match: OFF</li>
  <li>Client URIs Must Match: ON</li></ul>`,
  );

  setInnerHtml(
    "dyanmicClientRegistrationCurlRequest",
    `curl --request POST \\
  --url http://localhost:8080/realms/test/clients-registrations/openid-connect \\
  --header 'content-type: application/json' \\
  --data '{
    "client_name": "OCCA",
    "redirect_uris": [ "${data.redirectUri}" ],
    "grant_types": ["authorization_code","refresh_token"],
    "token_endpoint_auth_method": "none"
  }'`,
  );
}

export default {
  render,
};
