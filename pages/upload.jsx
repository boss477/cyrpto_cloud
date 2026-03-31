import Head from 'next/head';
import FileUpload from '../components/FileUpload';
import Link from 'next/link';

export default function UploadPage() {
    return (
        <div className="container">
            <Head>
                <title>Upload | Secure Storage</title>
            </Head>
            <nav>
                <Link href="/dashboard">← Back to Dashboard</Link>
                <h1>Secure File Upload</h1>
            </nav>
            <main>
                <FileUpload onUploadSuccess={() => window.location.href = '/dashboard'} />
            </main>
            <style jsx>{`
                .container { max-width: 800px; margin: 0 auto; padding: 20px; }
                nav { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
                h1 { margin: 0; }
            `}</style>
        </div>
    );
}
