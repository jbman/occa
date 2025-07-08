import JWT from "../util/jwt";
import JSONFormatter from "json-formatter-js";

const formatterConfig = {
  animateOpen: true,
  animateClose: true
};

function renderResponse(response) {
  document.getElementById("storedTokens").hidden = false;
  document
    .getElementById("idpResponseContainer")
    .replaceChildren(new JSONFormatter(response, 2, formatterConfig).render());
  document
    .getElementById("idpIdTokenContainer")
    .replaceChildren(
      new JSONFormatter(
        JWT.decode(response.id_token),
        2,
        formatterConfig
      ).render()
    );
  document
    .getElementById("idpAccessTokenContainer")
    .replaceChildren(
      new JSONFormatter(
        JWT.decode(response.access_token),
        2,
        formatterConfig
      ).render()
    );
}

function renderHideResponse() {
  document.getElementById("storedTokens").hidden = true;
}

// Get tokens of brokered IdP if ID token contains claim "idp_alias"
// The user and the client need to have client role broker.read-token, otherwise the request will fail
async function fetchIdpIdToken(bearerToken, idTokenEncoded) {
  // Check if URL for fetching ID token of target IdP is available as claim in ID token
  if (idTokenEncoded == null) {
    console.log(
      "Original tokens could not be be fetched: No ID token available"
    );
    renderHideResponse();
    return;
  }
  const idToken = JWT.decode(idTokenEncoded);
  if (idToken.claims.idp_alias == null) {
    console.log(
      "Original tokens could not be be fetched: Claim 'idp_alias' not present in ID token"
    );
    renderHideResponse();
    return;
  }

  // Build URL to fetch tokens:
  // - Keycloak URL has pattern "https://{host}/auth/realms/{realm}/broker/{alias}/token"
  // - Issuer is "https://{host}/auth/realms/{realm}"
  const iss = idToken.claims.iss;
  const idp_alias = idToken.claims.idp_alias;
  const url = `${iss}/broker/${idp_alias}/token`;

  // Fetch tokens
  fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + bearerToken
    }
  }).then((response) => response.json())
    .then((data) => {
      console.log("Original tokens could be fetched.");
      renderResponse(data);
    })
    .catch((error) => {
      console.log("Could not fetch token. Cross-Origin Request Blocked? Please check if the user has role 'broker.read-token' and the access token has the role listed at claim resource_access.");
      console.error("Error:", error);
    });
}

export default {
  fetchIdpIdToken: fetchIdpIdToken
};
