import { useState } from 'react';
import Head from 'next/head';
import { signUp, signIn } from '../auth/supabaseAuth';
import { useRouter } from 'next/router';
import Icon from '../components/Icon';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { if (isSignUp) { await signUp(email, password); alert('Account created! You can now log in.'); setIsSignUp(false); } else { await signIn(email, password); router.push('/dashboard'); } } catch (error) { alert(error.message); } finally { setLoading(false); } };
  return <><Head><title>{isSignUp ? 'Create account' : 'Sign in'} | Vaultly</title></Head><main className="auth-page"><section className="card auth-card"><div className="brand auth-brand"><span className="brand-mark"><Icon name="lock" size={19}/></span><span>Vaultly</span></div><h1>{isSignUp ? 'Create your secure vault' : 'Welcome back'}</h1><p className="intro">{isSignUp ? 'Encrypted storage for the files that matter.' : 'Sign in to access your encrypted workspace.'}</p><form onSubmit={handleSubmit}><div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div><div className="field"><label htmlFor="password">Password</label><input id="password" type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required /></div><button className="btn btn-primary" type="submit" disabled={loading}><Icon name="lock" size={17}/>{loading ? 'Securing…' : (isSignUp ? 'Create account' : 'Sign in')}</button></form><button className="switcher" onClick={()=>setIsSignUp(!isSignUp)}>{isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}</button></section></main></>;
}
