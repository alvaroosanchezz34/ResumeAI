'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        try {
            await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-sm space-y-4">
                <h1 className="text-2xl font-bold">Register</h1>

                {error && <p className="text-red-500">{error}</p>}

                <input
                    className="w-full border p-2"
                    placeholder="Email"
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    className="w-full border p-2"
                    type="password"
                    placeholder="Password"
                    onChange={e => setPassword(e.target.value)}
                />

                <button
                    className="w-full bg-black text-white py-2"
                    onClick={handleRegister}
                >
                    Create account
                </button>
            </div>
        </div>
    );
}
