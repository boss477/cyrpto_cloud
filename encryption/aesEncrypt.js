/**
 * Encrypts data using AES-GCM 256-bit.
 * @param {ArrayBuffer} data - The file data to encrypt.
 * @param {CryptoKey} [providedKey] - Optional AES key.
 * @param {Uint8Array} [providedIv] - Optional Initialization Vector.
 * @returns {Promise<{ciphertext: ArrayBuffer, iv: Uint8Array, key: CryptoKey}>}
 */
export async function aesEncrypt(data, providedKey = null, providedIv = null) {
    // Use provided key or generate a random 256-bit AES key
    const key = providedKey || await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );

    // Use provided IV or generate a random 12-byte IV
    const iv = providedIv || window.crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        data
    );

    return { ciphertext, iv, key };
}
