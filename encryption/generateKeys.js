/**
 * Generates an RSA-OAEP 2048-bit key pair.
 * The public key will be used to encrypt AES keys.
 * The private key will be used to decrypt AES keys.
 */
export async function generateRSAKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true, // extractable
        ["encrypt", "decrypt"]
    );

    // Export keys to JWK format for storage/use
    const publicKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privateKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

    return { publicKeyJWK, privateKeyJWK };
}
