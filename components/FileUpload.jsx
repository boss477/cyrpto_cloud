import { useState } from 'react';
import { uploadEncryptedFile } from '../storage/uploadEncryptedFile';
import RoleGuard from './RoleGuard';
import { PERMISSIONS } from '../rbac/roleCheck';
import Icon from './Icon';

export default function FileUpload({ onUploadSuccess }) {
  const [file,setFile]=useState(null), [description,setDescription]=useState(''), [uploading,setUploading]=useState(false);
  const handleUpload=async()=>{ if(!file&&!description.trim()){alert('Please select a file or enter a note.');return;} setUploading(true); try{await uploadEncryptedFile(file,description); alert('Encrypted and saved to your vault.'); setFile(null);setDescription('');if(onUploadSuccess)onUploadSuccess();}catch(error){console.error(error);alert('Upload failed: '+error.message);}finally{setUploading(false);} };
  return <RoleGuard allowedRoles={PERMISSIONS.UPLOAD}><div className="card upload-card"><div className="dropzone"><div className="empty-icon"><Icon name="upload"/></div><div style={{marginTop:14,fontWeight:750}}>Choose a file to encrypt</div><div style={{color:'var(--muted)',fontSize:13,marginTop:4}}>Images, PDF, DOC, and DOCX supported</div><input type="file" accept="image/*,.pdf,.doc,.docx" onChange={e=>setFile(e.target.files[0])}/>{file&&<div style={{marginTop:10,color:'var(--blue)',fontSize:13,fontWeight:700}}>{file.name}</div>}</div><div className="field" style={{marginTop:22}}><label htmlFor="description">Private note <span style={{color:'var(--muted)',fontWeight:400}}>(optional)</span></label><textarea id="description" placeholder="Add context for this record…" value={description} onChange={e=>setDescription(e.target.value)} /></div><button className="btn btn-primary" onClick={handleUpload} disabled={uploading}><Icon name="lock" size={17}/>{uploading?'Encrypting and uploading…':'Encrypt securely'}</button></div></RoleGuard>;
}
