/**
 * Decrypts an AES key using an RSA Private Key.
 * @param {ArrayBuffer} encryptedAesKey - The encrypted AES key.
 * @param {JsonWebKey} privateKeyJWK - The user's RSA Private Key in JWK format.
 * @returns {Promise<CryptoKey>}
 */
export async function rsaDecryptKey(encryptedAesKey, privateKeyJWK) {
    // Import the JWK private key
    const privateKey = await window.crypto.subtle.importKey(
        "jwk",
        privateKeyJWK,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );

    // Decrypt the raw AES key
    const rawAesKey = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        privateKey,
        encryptedAesKey
    );

    // Import the raw AES key back as a CryptoKey
    return await window.crypto.subtle.importKey(
        "raw",
        rawAesKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}
