'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '../../components/AuthCard';
import { api } from '../../../services/api';
import { setToken } from '../../../utils/auth';
import Link from 'next/link';

function InputField({
    label, type, value, onChange, placeholder,
}: {
    label: string; type: string; value: string;
    onChange: (v: string) => void; placeholder?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs text-white/40 font-medium uppercase tracking-wider">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors duration-200"
            />
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        setError('');
        try {
            const res = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            setToken(res.token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <AuthCard title="Welcome back" subtitle="Log in to your ResumeAI account">
            <div className="space-y-4" onKeyDown={handleKeyDown}>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                        <span className="text-red-400 text-sm shrink-0">✕</span>
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                />
                <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                />

                <button
                    onClick={handleLogin}
                    disabled={loading || !email || !password}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Signing in...
                        </>
                    ) : 'Sign in →'}
                </button>

                <div className="pt-2 border-t border-white/6 text-center">
                    <p className="text-white/30 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </AuthCard>
    );
}