# OCCA

OCCA is an **O**penID **C**onnect **C**lient **A**pplication. It is a plain HTML and Javascript single-page application.

OCCA was built to have a tool for exploring and testing OpenID Connect login without dependcies on any OAuth 2.0 or OpenID Connect library. 

# Usage

OCCA is there to execute OpenID Connect logins against an OAuth 2.0 authorization server or OpenID Connect identity provider. You need register OCCA as clientat your an authorization server like [Keycloak](https://github.com/keycloak/keycloak). Then you configure the client ID and relevant server endpoint at OCCA. Now you are ready to execute a login and you can check resulting tokens with OCCA.

The latest version of OCCA can be used at online at https://jbman.github.io/occa

# Install

Install and build with 

```
npm install
npm run build
```

This creates a `dist` folder with all application files. You can serve them with a web server of you choice.

For development you can serve the application at http://localhost:1234 by running

```
npm start
```

# License
This project is licensed under the [MIT License](LICENSE).