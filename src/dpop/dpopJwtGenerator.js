import {base64UrlEncode} from "../util/base64Util";

let accessToken;

function onLogin(accessTokenJwt) {
    accessToken = accessTokenJwt;
}

/**
 *
 * @param bindToHttpMethod - Method to be used on request
 * @param bindToTargetUri - Target URL you will call
 * @param keyPair - Generated client key-pair
 * @param publicJwk - Generated public client key
 * @param access_token - Can be null when token endpoint is called of auth server
 * @param nonce - random string
 * @returns {string} - DPoP proof
 */
async function generateDpopJwt(bindToHttpMethod, bindToTargetUri, keyPair, publicJwk, access_token, nonce) {
    const header = _generateHeader(publicJwk);
    const body = await _generateBody(bindToHttpMethod, bindToTargetUri, access_token, nonce);

    const textEncoder = new TextEncoder();
    const tokenWithoutSig = base64UrlEncode(textEncoder.encode(header)) + "." + base64UrlEncode(textEncoder.encode(body));

    const signature = await _generateSignature(keyPair.privateKey, tokenWithoutSig);

    return tokenWithoutSig + "." + signature;
}

function _generateHeader(publicJwk) {
    return JSON.stringify({
        typ: "dpop+jwt",
        alg: "RS256",
        jwk: {
            kty: publicJwk.kty,
            n: publicJwk.n,
            e: publicJwk.e
        }
    })
}

async function _generateBody(httpMethod, targetUri, access_token, nonce) {
    const generalBody = {
        jti: crypto.randomUUID(),
        htm: httpMethod,
        htu: targetUri,
        iat: Math.floor(Date.now() / 1000)
    }

    let body;

    if(access_token && nonce) {
        body = {
            ...generalBody,
            ath: await _hashAccessToken(access_token),
            nonce: nonce
        }
    } else {
        body = generalBody;
    }

    return JSON.stringify(body);
}

async function _generateSignature(privateKey, data) {
    const encodedData = new TextEncoder().encode(data);
    const signatureBuffer = await crypto.subtle.sign(
        {
            name: "RSASSA-PKCS1-v1_5",
        },
        privateKey,
        encodedData
    );

    return base64UrlEncode(signatureBuffer);
}

async function _hashAccessToken(access_token) {
    const data = new TextEncoder().encode(access_token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    return base64UrlEncode(hashBuffer);
}

export default {
    onLogin,
    generateDpopJwt
};