'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

type AIResult = {
    summary?: string;
    test?: {
        question: string;
        options: string[];
        correctAnswer: number;
    }[];
    development?: string[];
    flashcards?: {
        front: string;
        back: string;
    }[];
};

export default function GeneratePage() {
    const [text, setText] = useState('');
    const [type, setType] = useState<'summary' | 'test' | 'development' | 'flashcards'>('summary');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AIResult | null>(null);
    const [plan, setPlan] = useState<string>('free');

    // 🔐 Obtener plan del usuario
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api('/auth/me');
                setPlan(res.user.plan);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUser();
    }, []);

    // 🔒 Restricciones por plan
    const isLocked = (feature: string) => {
        if (plan === 'admin') return false;
        if (plan === 'free') {
            return feature !== 'summary' && feature !== 'flashcards';
        }
        return false;
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            setResult(null);

            const res = await api('/ai/generate', {
                method: 'POST',
                body: JSON.stringify({ text }),
            });

            setResult(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">

            <h1 className="text-3xl font-semibold">Generate Content</h1>

            {/* Textarea */}
            <div className="space-y-3">
                <textarea
                    className="w-full min-h-[200px] bg-[#111111] border border-white/10 rounded-lg p-4 focus:outline-none focus:border-white/30 transition"
                    placeholder="Paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <button
                    onClick={handleGenerate}
                    disabled={loading || !text}
                    className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Generate'}
                </button>
            </div>

            {/* Type selector */}
            <div className="flex gap-2 flex-wrap">
                {['summary', 'test', 'development', 'flashcards'].map((option) => {
                    const locked = isLocked(option);

                    return (
                        <button
                            key={option}
                            disabled={locked}
                            onClick={() => !locked && setType(option as any)}
                            className={`px-4 py-2 rounded-md text-sm capitalize transition relative
                ${type === option ? 'bg-white text-black' : 'border border-white/20 hover:border-white/40'}
                ${locked ? 'opacity-40 cursor-not-allowed' : ''}
              `}
                        >
                            {option}
                            {locked && (
                                <span className="ml-2 text-yellow-400 text-xs">PRO</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Result */}
            {result && (
                <div className="bg-[#111111] border border-white/10 rounded-lg p-6">

                    {/* SUMMARY */}
                    {type === 'summary' && result.summary && (
                        <div className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed">
                            {result.summary}
                        </div>
                    )}

                    {/* DEVELOPMENT */}
                    {type === 'development' && result.development && (
                        <div className="space-y-4">
                            {result.development.map((question, index) => (
                                <div
                                    key={index}
                                    className="bg-black/40 border border-white/10 p-4 rounded-md"
                                >
                                    {index + 1}. {question}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TEST */}
                    {type === 'test' && result.test && (
                        <div className="space-y-6">
                            {result.test.map((q, index) => (
                                <div
                                    key={index}
                                    className="bg-black/40 border border-white/10 p-5 rounded-lg space-y-3"
                                >
                                    <p className="text-white font-medium">
                                        {index + 1}. {q.question}
                                    </p>

                                    {q.options.map((option, i) => (
                                        <div
                                            key={i}
                                            className={`px-3 py-2 rounded-md text-sm ${i === q.correctAnswer
                                                    ? 'bg-green-500/20 border border-green-500'
                                                    : 'border border-white/10'
                                                }`}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FLASHCARDS */}
                    {type === 'flashcards' && result.flashcards && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {result.flashcards.map((card, index) => (
                                <div
                                    key={index}
                                    className="bg-black/40 border border-white/10 p-6 rounded-lg"
                                >
                                    <p className="text-white font-medium mb-3">
                                        {card.front}
                                    </p>

                                    <p className="text-white/60 text-sm">
                                        {card.back}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
