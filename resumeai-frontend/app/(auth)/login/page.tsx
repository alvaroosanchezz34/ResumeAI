'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '../../components/AuthCard';
import { api } from '../../../services/api';
import { setToken } from '../../../utils/auth';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            setToken(res.token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Welcome back"
            subtitle="Login to your ResumeAI account"
        >
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm text-white/60">Email</label>
                    <input
                        type="email"
                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:border-white/30 transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-white/60">Password</label>
                    <input
                        type="password"
                        className="w-full bg-black border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:border-white/30 transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <p className="text-sm text-white/50 text-center">
                    Don’t have an account?{' '}
                    <Link href="/register" className="text-white hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </AuthCard>
    );
}
