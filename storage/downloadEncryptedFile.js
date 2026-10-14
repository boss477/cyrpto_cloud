import { supabase } from '../utils/supabaseClient';
import { aesDecrypt } from '../encryption/aesDecrypt';
import { rsaDecryptKey } from '../encryption/rsaDecryptKey';

export async function downloadEncryptedFile(fileRecord) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 1. Retrieve Private Key from LocalStorage
    const privateKeyRaw = localStorage.getItem(`rsa_private_key_${user.id}`);
    if (!privateKeyRaw) throw new Error("Private key not found on this device");
    const privateKeyJWK = JSON.parse(privateKeyRaw);

    // 2. Download encrypted file from storage
    const { data: blob, error: storageError } = await supabase.storage
        .from('secure-files')
        .download(fileRecord.storage_path);

    if (storageError) throw storageError;

    const encryptedData = await blob.arrayBuffer();

    // 3. Retrieve and Parse Encrypted AES Key
    const { key: encryptedKeyB64, iv: ivB64 } = JSON.parse(fileRecord.encrypted_key);

    // Convert base64 back to buffers
    const encryptedAesKeyBuffer = Uint8Array.from(atob(encryptedKeyB64), c => c.charCodeAt(0)).buffer;
    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));

    // 4. Decrypt AES Key with RSA Private Key
    const aesKey = await rsaDecryptKey(encryptedAesKeyBuffer, privateKeyJWK);

    // 5. Decrypt File with AES Key
    const decryptedData = await aesDecrypt(encryptedData, aesKey, iv);

    // 6. Trigger Download
    const decryptedBlob = new Blob([decryptedData]);
    const url = URL.createObjectURL(decryptedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileRecord.filename || 'secure-file';
    a.click();
    URL.revokeObjectURL(url);
}
