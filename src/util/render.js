import JWT from "./jwt";
import JSONFormatter from "json-formatter-js";

const formatterConfig = {
  animateOpen: true,
  animateClose: true,
};

function renderAuthResponse(response) {
  document
    .getElementById("responseContainer")
    .replaceChildren(new JSONFormatter(response, 2, formatterConfig).render());
  document
    .getElementById("idTokenContainer")
    .replaceChildren(
      new JSONFormatter(
        JWT.decode(response.id_token),
        2,
        formatterConfig
      ).render()
    );
  document
    .getElementById("accessTokenContainer")
    .replaceChildren(
      new JSONFormatter(
        JWT.decode(response.access_token),
        2,
        formatterConfig
      ).render()
    );
}

function renderLoginError(title, text) {
  document.getElementById(
    "responseContainer"
  ).innerHTML = `<article class="card error">
  <header>
    <h3>${title}</h3>
  </header>
  <p>${text}</p>
  </article>`;
}

function renderUserInfo(response) {
  document
    .getElementById("userinfoContainer")
    .replaceChildren(new JSONFormatter(response, 2, formatterConfig).render());
}

function renderNotification(type, text) {
  const notification = document.createElement("label");
  notification.classList.add("notification");
  notification.innerHTML = 
  `<input type="checkbox" class="alertCheckbox" autocomplete="off" />
  <div class="alert ${type}">
    <span class="alertClose">X</span>
    <span class="alertText">${text}</span>
  </div>`;
  document.getElementById("notificationContainer").prepend(notification);
}

function notifySuccess(text) {
  renderNotification("success", text)
}

function notifyInfo(text) {
  renderNotification("info", text)
}

function notifyError(text) {
  renderNotification("error", text)
}

export default {
  renderAuthResponse,
  renderLoginError,
  renderUserInfo,
  notifySuccess,
  notifyInfo,
  notifyError
};
