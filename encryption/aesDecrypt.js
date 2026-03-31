/**
 * Decrypts data using AES-GCM 256-bit.
 * @param {ArrayBuffer} ciphertext - The encrypted data.
 * @param {CryptoKey} key - The AES key.
 * @param {Uint8Array} iv - The initialization vector.
 * @returns {Promise<ArrayBuffer>}
 */
export async function aesDecrypt(ciphertext, key, iv) {
    return await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        ciphertext
    );
}
