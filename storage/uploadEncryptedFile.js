import { supabase } from '../utils/supabaseClient';
import { aesEncrypt } from '../encryption/aesEncrypt';
import { rsaEncryptKey } from '../encryption/rsaEncryptKey';

export async function uploadEncryptedFile(file, description = '') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get user's public key from DB
    const { data: userData } = await supabase
        .from('users')
        .select('public_key')
        .eq('id', user.id)
        .single();

    if (!userData || !userData.public_key) {
        throw new Error("Your cryptographic keys are missing. Please log out and sign up with a fresh account.");
    }

    const publicKeyJWK = JSON.parse(userData.public_key);

    // 1. Handle Encryption Keys
    // We always generate an AES key and IV, even for text-only, to encrypt the description field or file
    const { key: aesKey, iv } = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    ).then(async (key) => {
        return { key, iv: window.crypto.getRandomValues(new Uint8Array(12)) };
    });

    let storagePath = null;
    let filename = null;

    if (file) {
        filename = file.name;
        // 2. Encrypt file with AES-GCM
        const fileBuffer = await file.arrayBuffer();
        const { ciphertext } = await aesEncrypt(fileBuffer, aesKey, iv); // Adjusted to accept key/iv

        // 3. Upload encrypted file to Supabase Storage
        storagePath = `files/${user.id}/${Date.now()}_${file.name}`;
        const { error: storageError } = await supabase.storage
            .from('secure-files')
            .upload(storagePath, ciphertext);

        if (storageError) throw storageError;
    }

    // 4. Encrypt AES key with user's RSA Public Key
    const encryptedAesKeyBuffer = await rsaEncryptKey(aesKey, publicKeyJWK);

    // Convert keys/iv to base64 for storage
    const encryptedKeyB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedAesKeyBuffer)));
    const ivB64 = btoa(String.fromCharCode(...iv));

    // 5. Store metadata in 'files' table
    const { error: dbError } = await supabase
        .from('files')
        .insert({
            filename: filename,
            description: description, // This is our text note
            owner_id: user.id,
            storage_path: storagePath,
            encrypted_key: JSON.stringify({ key: encryptedKeyB64, iv: ivB64 }),
        });

    if (dbError) throw dbError;

    return { success: true };
}
