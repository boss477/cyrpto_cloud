/**
 * Encrypts an AES key using an RSA Public Key.
 * @param {CryptoKey} aesKey - The AES key to encrypt.
 * @param {JsonWebKey} publicKeyJWK - The user's RSA Public Key in JWK format.
 * @returns {Promise<ArrayBuffer>}
 */
export async function rsaEncryptKey(aesKey, publicKeyJWK) {
    // Import the JWK public key
    const publicKey = await window.crypto.subtle.importKey(
        "jwk",
        publicKeyJWK,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );

    // Export the raw AES key to encrypt it
    const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

    // Encrypt the raw AES key with RSA
    return await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        rawAesKey
    );
}
