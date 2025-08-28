# OCCA

OCCA is an **O**penID **C**onnect **C**lient **A**pplication. It is a plain HTML and JavaScript single-page application.

OCCA was built as a tool for exploring and testing OpenID Connect logins without relying on an existing OAuth 2.0 or OpenID Connect library.

## Usage

With OCCA, you can perform OpenID Connect logins against an OAuth 2.0 authorization server or OpenID Connect identity provider.

### Steps:

1. **Register OCCA as a client**  
   - Go to your authorization server (e.g., [Keycloak](https://github.com/keycloak/keycloak)).  
   - Create a new client application entry for OCCA. OCCA Provides instructions how to do this.

2. **Configure OCCA**  
   - Enter the client ID and the relevant server endpoints (authorization, token, and user info endpoints).

3. **Run a login**  
   - Use OCCA to initiate a login request against your server.
   - After a successful login, OCCA will display the resulting tokens (ID token, access token, etc.).

4. **Inspect tokens**  
   - View and analyze the tokens directly in OCCA to verify claims, expiration, and scopes.

The latest version of OCCA is available online at:  
👉 https://jbman.github.io/occa

## Install

Install and build with 

```
npm install
npm run build
```

This creates a `dist` folder with all application files. You can serve them with a web server of your choice.

For development, you can serve the application at http://localhost:1234 by running:

```
npm start
```

## License
This project is licensed under the [MIT License](LICENSE).