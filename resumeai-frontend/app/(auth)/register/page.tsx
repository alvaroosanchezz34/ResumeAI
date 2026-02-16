'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '../../components/AuthCard';
import { api } from '../../../services/api';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try {
            setLoading(true);
            setError('');

            await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Create account"
            subtitle="Start studying smarter today"
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
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                    {loading ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-sm text-white/50 text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="text-white hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </AuthCard>
    );
}
