import { useState } from 'react';
import Head from 'next/head';
import { signUp, signIn } from '../auth/supabaseAuth';
import { useRouter } from 'next/router';

export default function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignUp) {
                await signUp(email, password);
                alert("Account created! You can now log in.");
                setIsSignUp(false);
            } else {
                await signIn(email, password);
                router.push('/dashboard');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <Head>
                <title>{isSignUp ? 'Sign Up' : 'Login'} | Secure Storage</title>
            </Head>
            <div className="card">
                <h1>{isSignUp ? 'Create Account' : 'Login'}</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Register' : 'Login')}
                    </button>
                </form>
                <p onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </p>
            </div>
            <style jsx>{`
                .container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
                .card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
                form { display: flex; flex-direction: column; gap: 15px; }
                input, select, button { padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
                button { background: #0070f3; color: white; border: none; cursor: pointer; }
                button:disabled { background: #ccc; }
                p { text-align: center; color: #0070f3; cursor: pointer; margin-top: 20px; }
            `}</style>
        </div>
    );
}
