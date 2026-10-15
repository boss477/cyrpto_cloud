import Head from 'next/head'; import FileUpload from '../components/FileUpload'; import Link from 'next/link'; import Icon from '../components/Icon';

export default function UploadPage() {
    return (
        <div className="app-shell">
            <Head>
                <title>Upload | Secure Storage</title>
            </Head>
            <header className="topbar"><Link href="/dashboard" className="brand"><span className="brand-mark"><Icon name="lock" size={19}/></span>Vaultly</Link><Link className="btn btn-ghost" href="/dashboard">Back to vault</Link></header>
            <main className="page-wrap">
                <div className="eyebrow">Secure upload</div><h1 className="page-title">Add something private</h1><p className="page-subtitle" style={{marginBottom:28}}>Your file is encrypted in the browser before it leaves your device.</p>
                <FileUpload onUploadSuccess={() => window.location.href = '/dashboard'} />
            </main>
        </div>
    );
}
