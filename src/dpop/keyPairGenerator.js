async function generateRS256KeyPairForDPoP() {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",   // = RS256
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
            hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
    );

    const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

    return { keyPair, publicJwk };
}

export default {
    generateRS256KeyPairForDPoP
};