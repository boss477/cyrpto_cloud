import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { downloadEncryptedFile } from '../storage/downloadEncryptedFile';
import RoleGuard from './RoleGuard';
import { PERMISSIONS } from '../rbac/roleCheck';
import Icon from './Icon';

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

    if (loading) return <div className="card empty-state"><div className="empty-icon"><Icon name="lock" /></div><h3>Opening your vault…</h3><p>Checking your encrypted records.</p></div>;

    const userRole = currentUser?.user_metadata?.role || 'viewer';

    return (
        <div className="card table-card">
            <div className="list-head">
                <div><h2>Your records</h2><span style={{color:'var(--muted)',fontSize:13}}>Only you and approved roles can access these</span></div>
                <span className="role-pill"><Icon name="shield" size={14}/> {userRole}</span>
            </div>
            <div className="table-wrap"><table>
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
                                <td><span className="file-name"><span className="file-icon"><Icon name="file" size={16}/></span>{file.filename || <em style={{ color: '#aaa' }}>Text note</em>}</span></td>
                                <td className="notes-cell">{file.description || <em style={{ color: '#ccc' }}>No notes</em>}</td>
                                <td>{new Date(file.created_at).toLocaleString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        {file.storage_path && (
                                            <RoleGuard allowedRoles={PERMISSIONS.DOWNLOAD}>
                                                <button className="icon-btn btn-primary" onClick={() => handleDownload(file)}><Icon name="download" size={14}/>Download</button>
                                            </RoleGuard>
                                        )}
                                        {canDelete && (
                                            <RoleGuard allowedRoles={PERMISSIONS.DELETE}>
                                                <button className="icon-btn btn-danger" onClick={() => handleDelete(file.id, file.storage_path)}><Icon name="trash" size={14}/>Delete</button>
                                            </RoleGuard>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table></div>
        </div>
    );
}
