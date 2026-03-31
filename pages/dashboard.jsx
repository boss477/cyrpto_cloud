import Head from 'next/head';
import FileList from '../components/FileList';
import Link from 'next/link';
import { signOut } from '../auth/supabaseAuth';
import { useRouter } from 'next/router';

export default function Dashboard() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="container">
            <Head>
                <title>Dashboard | Secure Storage</title>
            </Head>
            <nav>
                <h1>Secure Cloud Storage</h1>
                <div>
                    <Link href="/upload">Upload</Link>
                    <button onClick={handleLogout} style={{ marginLeft: '20px' }}>Logout</button>
                </div>
            </nav>
            <main>
                <FileList />
            </main>
            <style jsx>{`
                .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
                nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                nav a { text-decoration: none; color: blue; font-weight: bold; }
            `}</style>
        </div>
    );
}
