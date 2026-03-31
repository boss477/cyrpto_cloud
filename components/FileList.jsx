import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { downloadEncryptedFile } from '../storage/downloadEncryptedFile';
import RoleGuard from './RoleGuard';
import { PERMISSIONS } from '../rbac/roleCheck';

export default function FileList() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentUser, setCurrentUser] = useState(null);

    const fetchFiles = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const { data, error } = await supabase
            .from('files')
            .select('*, users(email)')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setFiles(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDownload = async (file) => {
        try {
            await downloadEncryptedFile(file);
        } catch (error) {
            console.error(error);
            alert("Download/Decryption failed: " + error.message);
        }
    };

    const handleDelete = async (fileId, storagePath) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;

        const { error: dbError } = await supabase.from('files').delete().eq('id', fileId);

        // Only try to delete from storage if there was a path
        if (storagePath) {
            await supabase.storage.from('secure-files').remove([storagePath]);
        }

        if (dbError) {
            console.error(dbError);
            alert("Delete failed: " + dbError.message);
        } else {
            fetchFiles();
        }
    };

    if (loading) return <div>Loading records...</div>;

    const userRole = currentUser?.user_metadata?.role || 'viewer';

    return (
        <div className="file-list">
            <div className="list-header">
                <h3>Secure Cloud Records</h3>
                <span className="role-tag">View: {userRole.toUpperCase()}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Owner</th>
                        <th>Filename</th>
                        <th>Notes (Encrypted)</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map(file => {
                        const isOwner = currentUser?.id === file.owner_id;
                        const isAdmin = userRole === 'admin';
                        const canDelete = isAdmin || isOwner;

                        return (
                            <tr key={file.id}>
                                <td><span className="owner-email">{file.users?.email || 'Unknown'}</span></td>
                                <td>{file.filename || <em style={{ color: '#aaa' }}>Text Only</em>}</td>
                                <td className="notes-cell">{file.description || <em style={{ color: '#ccc' }}>No notes</em>}</td>
                                <td>{new Date(file.created_at).toLocaleString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        {file.storage_path && (
                                            <RoleGuard allowedRoles={PERMISSIONS.DOWNLOAD}>
                                                <button className="btn-download" onClick={() => handleDownload(file)}>Download</button>
                                            </RoleGuard>
                                        )}
                                        {canDelete && (
                                            <RoleGuard allowedRoles={PERMISSIONS.DELETE}>
                                                <button className="btn-delete" onClick={() => handleDelete(file.id, file.storage_path)}>Delete</button>
                                            </RoleGuard>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <style jsx>{`
                .file-list { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .role-tag { background: #eee; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #f8f9fa; padding: 15px 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #eee; }
                td { padding: 15px 10px; border-bottom: 1px solid #eee; }
                .owner-email { font-size: 13px; color: #666; font-family: monospace; }
                .notes-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .action-buttons { display: flex; gap: 8px; }
                button { padding: 8px 12px; border-radius: 6px; border: none; font-size: 13px; cursor: pointer; font-weight: 500; }
                .btn-download { background: #0070f3; color: white; }
                .btn-delete { background: #fff; color: #ff4d4f; border: 1px solid #ff4d4f; }
                .btn-delete:hover { background: #fff1f0; }
            `}</style>
        </div>
    );
}
