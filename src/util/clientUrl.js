/** 
 * Resolves the redirect URI of this application based on window.location.href passed as argument (e.g. https://jbman.github.io/occa/index.html?clientId=github-occa#welcome)
*/
function resolveRedirctUri(href) {
    // Redirection URI is same as application URL, but needs to be normalized: Remove filename, Append slash if missing, Remove parameters ans hash (#)
    const url = new URL(href);
    // Remove filename index.html from url if present at end of path
    const indexFilename = "index.html";
    if (url.pathname.endsWith(indexFilename)) {
        url.pathname = url.pathname.slice(0, -indexFilename.length);
    }
    // Normalize to ensure it ends with a slash
    if (!url.pathname.endsWith("/")) {
        url.pathname += "/";
    }
    url.hash = '';
    url.search = '';
    return url.href;
}

export default {
    resolveRedirctUri: resolveRedirctUri
};