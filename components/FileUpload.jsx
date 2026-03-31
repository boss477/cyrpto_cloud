import { useState } from 'react';
import { uploadEncryptedFile } from '../storage/uploadEncryptedFile';
import RoleGuard from './RoleGuard';
import { PERMISSIONS } from '../rbac/roleCheck';

export default function FileUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file && !description.trim()) {
            alert("Please select a file or enter some text to encrypt.");
            return;
        }
        setUploading(true);
        try {
            await uploadEncryptedFile(file, description);
            alert("Success! Your data has been encrypted and saved.");
            setFile(null);
            setDescription('');
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            console.error(error);
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <RoleGuard allowedRoles={PERMISSIONS.UPLOAD}>
            <div className="upload-card">
                <div className="input-group">
                    <label>Select Image/File</label>
                    <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>

                <div className="input-group">
                    <label>Add Notes/Text (Encrypted)</label>
                    <textarea
                        placeholder="Enter text note here..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </div>

                <button onClick={handleUpload} disabled={uploading}>
                    {uploading ? "Locking & Uploading..." : "Secure Upload"}
                </button>
            </div>
            <style jsx>{`
                .upload-card {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                label { font-weight: 600; color: #333; }
                input, textarea {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 15px;
                    background: #fafafa;
                }
                textarea { resize: vertical; }
                button {
                    background: #0070f3;
                    color: white;
                    padding: 14px;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.1s;
                }
                button:hover { background: #0056b3; }
                button:active { transform: scale(0.98); }
                button:disabled { background: #ccc; cursor: not-allowed; }
            `}</style>
        </RoleGuard>
    );
}
