'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/services/api';

export default function GeneratePage() {
    const [text, setText] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        try {
            setLoading(true);
            setError('');

            // 1. Generar IA
            const aiRes = await api('/ai/generate', {
                method: 'POST',
                body: JSON.stringify({ text })
            });

            // 2. Guardar documento
            await api('/documents', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Generated document',
                    originalText: text,
                    generated: aiRes.data
                })
            });

            // 3. Mostrar resultado
            setResult(aiRes.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <ProtectedRoute>
            <div className="min-h-screen p-8 space-y-6">
                <h1 className="text-2xl font-bold">Generate content</h1>
                <div className="bg-white rounded-lg border p-6 space-y-4">
                    <textarea
                        className="w-full border p-4 min-h-37.5"
                        placeholder="Paste your text here..."
                        onChange={e => setText(e.target.value)}
                    />

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-black text-white px-4 py-2"
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                {result && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Summary</h2>
                        <p>{result.summary}</p>

                        <h2 className="text-xl font-semibold">Flashcards</h2>
                        <ul className="list-disc ml-6">
                            {result.flashcards.map((f: any, i: number) => (
                                <li key={i}>
                                    <strong>{f.front}:</strong> {f.back}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
