'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { setToken } from '@/utils/auth';

type Section = 'email' | 'password';

function SuccessBanner({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2.5 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
            <span className="text-emerald-400 shrink-0">✓</span>
            <p className="text-emerald-300 text-sm">{message}</p>
        </div>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
            <span className="text-red-400 shrink-0">✕</span>
            <p className="text-red-400 text-sm">{message}</p>
        </div>
    );
}

function InputField({ label, type, value, onChange, placeholder, hint }: {
    label: string; type: string; value: string;
    onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</label>
            <input
                type={type} value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
            />
            {hint && <p className="text-white/20 text-xs">{hint}</p>}
        </div>
    );
}

export default function ProfilePage() {
    const [currentEmail, setCurrentEmail] = useState('');
    const [plan, setPlan] = useState('');
    const [activeSection, setActiveSection] = useState<Section | null>(null);

    // Email form
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        api('/auth/me').then(res => {
            setCurrentEmail(res.user.email);
            setPlan(res.user.plan);
        }).catch(() => { });
    }, []);

    const resetMessages = () => { setSuccess(''); setError(''); };

    const handleEmailUpdate = async () => {
        resetMessages();
        if (!newEmail || !emailPassword) return;
        if (newEmail === currentEmail) {
            setError('New email is the same as the current one.');
            return;
        }
        setLoading(true);
        try {
            const res = await api('/auth/update-email', {
                method: 'PATCH',
                body: JSON.stringify({ newEmail, password: emailPassword })
            });
            if (res.token) setToken(res.token);
            setCurrentEmail(newEmail);
            setNewEmail('');
            setEmailPassword('');
            setActiveSection(null);
            setSuccess('Email updated successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to update email.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        resetMessages();
        if (!currentPassword || !newPassword || !confirmPassword) return;
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            const res = await api('/auth/update-password', {
                method: 'PATCH',
                body: JSON.stringify({ currentPassword, newPassword })
            });
            if (res.token) setToken(res.token);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setActiveSection(null);
            setSuccess('Password updated successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    const PLAN_BADGE: Record<string, string> = {
        free: 'text-white/50 bg-white/6 border-white/10',
        premium: 'text-violet-300 bg-violet-500/12 border-violet-500/25',
        pro: 'text-indigo-300 bg-indigo-500/12 border-indigo-500/25',
        admin: 'text-amber-300 bg-amber-500/12 border-amber-500/25',
        custom: 'text-emerald-300 bg-emerald-500/12 border-emerald-500/25',
    };

    return (
        <div className="page-container space-y-8 max-w-5xl">

            <div>
                <h1 className="text-3xl font-black tracking-tight">Profile</h1>
                <p className="text-white/35 text-sm mt-1">Manage your account settings.</p>
            </div>

            {/* Mensajes globales */}
            {success && <SuccessBanner message={success} />}
            {error && <ErrorBanner message={error} />}

            {/* Info actual */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
                <p className="text-white/35 text-xs font-medium uppercase tracking-wider">Account info</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-white/30 mb-1">Email</p>
                        <p className="text-white font-medium">{currentEmail}</p>
                    </div>
                    <div>
                        <p className="text-xs text-white/30 mb-1">Plan</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${PLAN_BADGE[plan] ?? PLAN_BADGE.free}`}>
                            {plan}
                        </span>
                    </div>
                </div>
            </div>

            {/* Cambiar email */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                <button
                    onClick={() => { setActiveSection(activeSection === 'email' ? null : 'email'); resetMessages(); }}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                    <div className="text-left">
                        <p className="text-white font-semibold text-sm">Change email</p>
                        <p className="text-white/30 text-xs mt-0.5">Update your login email address</p>
                    </div>
                    <span className={`text-white/30 transition-transform duration-200 ${activeSection === 'email' ? 'rotate-180' : ''}`}>
                        ▾
                    </span>
                </button>

                {activeSection === 'email' && (
                    <div className="px-6 pb-6 space-y-4 border-t border-white/6 pt-5">
                        <InputField
                            label="New email"
                            type="email"
                            value={newEmail}
                            onChange={setNewEmail}
                            placeholder="new@example.com"
                        />
                        <InputField
                            label="Confirm with your password"
                            type="password"
                            value={emailPassword}
                            onChange={setEmailPassword}
                            placeholder="••••••••"
                        />
                        <button
                            onClick={handleEmailUpdate}
                            disabled={loading || !newEmail || !emailPassword}
                            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Saving…
                                </>
                            ) : 'Update email'}
                        </button>
                    </div>
                )}
            </div>

            {/* Cambiar contraseña */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                <button
                    onClick={() => { setActiveSection(activeSection === 'password' ? null : 'password'); resetMessages(); }}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                    <div className="text-left">
                        <p className="text-white font-semibold text-sm">Change password</p>
                        <p className="text-white/30 text-xs mt-0.5">Choose a new password for your account</p>
                    </div>
                    <span className={`text-white/30 transition-transform duration-200 ${activeSection === 'password' ? 'rotate-180' : ''}`}>
                        ▾
                    </span>
                </button>

                {activeSection === 'password' && (
                    <div className="px-6 pb-6 space-y-4 border-t border-white/6 pt-5">
                        <InputField
                            label="Current password"
                            type="password"
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            placeholder="••••••••"
                        />
                        <InputField
                            label="New password"
                            type="password"
                            value={newPassword}
                            onChange={setNewPassword}
                            placeholder="••••••••"
                            hint="Minimum 6 characters"
                        />
                        <InputField
                            label="Confirm new password"
                            type="password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="••••••••"
                        />
                        <button
                            onClick={handlePasswordUpdate}
                            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Saving…
                                </>
                            ) : 'Update password'}
                        </button>
                    </div>
                )}
            </div>

            {/* Zona de peligro */}
            <div className="bg-red-500/[0.04] border border-red-500/15 rounded-2xl p-6 space-y-3">
                <p className="text-white/35 text-xs font-medium uppercase tracking-wider">Danger zone</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/70 text-sm font-medium">Delete account</p>
                        <p className="text-white/30 text-xs mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <button
                        onClick={() => alert('Contact support to delete your account.')}
                        className="px-4 py-2 rounded-xl border border-red-500/25 text-red-400 hover:bg-red-500/10 text-sm transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>

        </div>
    );
}