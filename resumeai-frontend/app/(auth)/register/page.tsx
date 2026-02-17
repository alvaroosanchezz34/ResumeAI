'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '../../components/AuthCard';
import { api } from '../../../services/api';
import Link from 'next/link';

function InputField({
    label, type, value, onChange, placeholder, hint,
}: {
    label: string; type: string; value: string;
    onChange: (v: string) => void; placeholder?: string; hint?: string;
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
            {hint && <p className="text-white/20 text-xs">{hint}</p>}
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState(false);

    const handleRegister = async () => {
        if (!email || !password) return;
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 1500);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRegister();
    };

    if (success) {
        return (
            <AuthCard title="Account created!" subtitle="Redirecting you to login...">
                <div className="flex flex-col items-center py-6 gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl">
                        ✓
                    </div>
                    <p className="text-white/40 text-sm text-center">
                        Your account is ready. Taking you to login...
                    </p>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Create account" subtitle="Start studying smarter — it's free">
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
                    hint="Minimum 6 characters"
                />

                <button
                    onClick={handleRegister}
                    disabled={loading || !email || !password}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Creating account...
                        </>
                    ) : 'Create account →'}
                </button>

                {/* Guarantees */}
                <div className="flex justify-center gap-4 text-white/20 text-xs pt-1">
                    <span>✓ Free forever</span>
                    <span>✓ No card needed</span>
                </div>

                <div className="pt-2 border-t border-white/6 text-center">
                    <p className="text-white/30 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </AuthCard>
    );
}