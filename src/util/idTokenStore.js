const ID_TOKEN_KEY = "idToken";

function store(idTokenEncoded) {
  window.sessionStorage.setItem(ID_TOKEN_KEY, idTokenEncoded);
}

function get() {
  return window.sessionStorage.getItem(ID_TOKEN_KEY);
}

function discard() {
  window.sessionStorage.removeItem(ID_TOKEN_KEY);
}

export default {
  store: store,
  get: get,
  discard: discard,
};
