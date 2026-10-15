import Head from 'next/head'; import FileList from '../components/FileList'; import Link from 'next/link'; import { signOut } from '../auth/supabaseAuth'; import { useRouter } from 'next/router'; import Icon from '../components/Icon';

export default function Dashboard() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="app-shell">
            <Head>
                <title>Dashboard | Secure Storage</title>
            </Head>
            <header className="topbar"><Link href="/dashboard" className="brand"><span className="brand-mark"><Icon name="lock" size={19}/></span>Vaultly</Link><button className="btn btn-ghost" onClick={handleLogout}>Sign out</button></header>
            <main className="page-wrap">
                <div className="dashboard-head"><div><div className="eyebrow">Private workspace</div><h1 className="page-title">Your secure vault</h1><p className="page-subtitle">Encrypted files and notes, protected in transit and at rest.</p></div><Link className="btn btn-primary" href="/upload"><Icon name="upload" size={17}/>Add to vault</Link></div>
                <FileList />
            </main>
        </div>
    );
}
