import JWT from "./jwt";
import JSONFormatter from "json-formatter-js";

const formatterConfig = {
  animateOpen: true,
  animateClose: true,
};

function renderConfig(config, configShareLink) {
  document
    .getElementById("currentConfig")
    .replaceChildren(new JSONFormatter(config, 1, formatterConfig).render());

  _renderConfigLink(
    configShareLink,
    "OCCA for " + new URL(config.discoveryEndpoint).host,
  );
}

function _renderConfigLink(link, text) {
  const configLink = document.getElementById("configLink");
  configLink.setAttribute("href", link);
  configLink.textContent = text;
}

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
        formatterConfig,
      ).render(),
    );
  document
    .getElementById("accessTokenContainer")
    .replaceChildren(
      new JSONFormatter(
        JWT.decode(response.access_token),
        2,
        formatterConfig,
      ).render(),
    );
}

function renderUserInfo(response) {
  document
    .getElementById("userinfoContainer")
    .replaceChildren(new JSONFormatter(response, 2, formatterConfig).render());
}

function renderNotification(type, text, targetId) {
  const notification = document.createElement("label");
  notification.classList.add("notification");
  notification.innerHTML = `<input type="checkbox" class="alertCheckbox" autocomplete="off" />
  <div class="alert ${type}">
    <span class="alertClose">X</span>
    <span class="alertText">${text}</span>
  </div>`;
  document.getElementById(targetId).replaceChildren(notification);
}

function notifySuccess(text, targetId) {
  renderNotification("success", text, targetId);
}

function notifyInfo(text, targetId) {
  renderNotification("info", text, targetId);
}

function notifyError(text, targetId) {
  renderNotification("error", text, targetId);
}

export default {
  renderConfig,
  renderAuthResponse,
  renderUserInfo,
  notifySuccess,
  notifyInfo,
  notifyError,
};
