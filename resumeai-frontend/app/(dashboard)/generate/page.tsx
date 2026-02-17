'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

type Question = { question: string; options: string[]; correctAnswer: number };
type Flashcard = { front: string; back: string };
type AIResult = {
    summary?: string;
    test?: Question[];
    development?: string[];
    flashcards?: Flashcard[];
};
type Tab = 'summary' | 'test' | 'development' | 'flashcards';

const MAX_CHARS = 8000;

/* ── Quiz component (responde antes de ver la respuesta) ── */
function QuizView({ questions }: { questions: Question[] }) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [revealed, setRevealed] = useState<Record<number, boolean>>({});

    const pick = (qi: number, oi: number) => {
        if (revealed[qi]) return;
        setAnswers(prev => ({ ...prev, [qi]: oi }));
        setRevealed(prev => ({ ...prev, [qi]: true }));
    };

    const score = Object.keys(revealed).filter(
        k => answers[+k] === questions[+k].correctAnswer
    ).length;

    const total = Object.keys(revealed).length;

    return (
        <div className="space-y-6">
            {total > 0 && (
                <div className="flex items-center gap-3">
                    <div className="text-sm text-white/40">{total} of {questions.length} answered</div>
                    <div className="flex-1 bg-white/6 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${(total / questions.length) * 100}%` }}
                        />
                    </div>
                    <div className="text-sm font-semibold text-violet-400">{score}/{total} correct</div>
                </div>
            )}

            {questions.map((q, qi) => (
                <div key={qi} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
                    <p className="text-white font-semibold leading-relaxed">
                        <span className="text-violet-400 mr-2">{qi + 1}.</span>
                        {q.question}
                    </p>
                    <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                            const isRevealed = revealed[qi];
                            const isPicked   = answers[qi] === oi;
                            const isCorrect  = q.correctAnswer === oi;

                            let cls = 'border border-white/8 text-white/60 hover:border-white/20 hover:text-white cursor-pointer';
                            if (isRevealed) {
                                if (isCorrect)          cls = 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-300 cursor-default';
                                else if (isPicked)      cls = 'border border-red-500/60 bg-red-500/10 text-red-300 cursor-default';
                                else                    cls = 'border border-white/5 text-white/25 cursor-default';
                            }

                            return (
                                <button
                                    key={oi}
                                    onClick={() => pick(qi, oi)}
                                    disabled={!!isRevealed}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${cls}`}
                                >
                                    <span className="text-white/30 mr-2 font-mono text-xs">
                                        {String.fromCharCode(65 + oi)}.
                                    </span>
                                    {opt}
                                    {isRevealed && isCorrect && (
                                        <span className="float-right text-emerald-400 text-xs font-semibold">✓ Correct</span>
                                    )}
                                    {isRevealed && isPicked && !isCorrect && (
                                        <span className="float-right text-red-400 text-xs font-semibold">✗ Wrong</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {!revealed[qi] && (
                        <p className="text-white/20 text-xs">Click an option to answer</p>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── Flashcard component (flip) ── */
function FlashcardView({ cards }: { cards: Flashcard[] }) {
    const [flipped, setFlipped] = useState<Record<number, boolean>>({});

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {cards.map((card, i) => (
                <button
                    key={i}
                    onClick={() => setFlipped(prev => ({ ...prev, [i]: !prev[i] }))}
                    className="group relative bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-0.5 min-h-[120px] overflow-hidden"
                >
                    <div className="absolute top-3 right-3 text-[10px] text-white/20 uppercase tracking-wider">
                        {flipped[i] ? 'Answer' : 'Term'} · click to flip
                    </div>
                    {!flipped[i] ? (
                        <p className="font-semibold text-white leading-relaxed mt-3">{card.front}</p>
                    ) : (
                        <p className="text-white/65 text-sm leading-relaxed mt-3">{card.back}</p>
                    )}
                </button>
            ))}
        </div>
    );
}

/* ── Main page ── */
export default function GeneratePage() {
    const [text, setText]     = useState('');
    const [tab, setTab]       = useState<Tab>('summary');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AIResult | null>(null);
    const [plan, setPlan]     = useState('free');
    const [error, setError]   = useState('');

    useEffect(() => {
        api('/auth/me')
            .then(res => setPlan(res.user.plan))
            .catch(() => {});
    }, []);

    const isLocked = (f: string) => {
        if (plan === 'admin' || plan === 'premium' || plan === 'pro') return false;
        return f !== 'summary' && f !== 'flashcards';
    };

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setError('');
        setLoading(true);
        setResult(null);
        try {
            const res = await api('/ai/generate', {
                method: 'POST',
                body: JSON.stringify({ text }),
            });
            setResult(res.data);
            setTab('summary');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'summary',     label: 'Summary',     icon: '📄' },
        { key: 'test',        label: 'Quiz',         icon: '📝' },
        { key: 'flashcards',  label: 'Flashcards',  icon: '🃏' },
        { key: 'development', label: 'Open Q&A',    icon: '💬' },
    ];

    const chars = text.length;
    const charsLeft = MAX_CHARS - chars;

    return (
        <div className="p-8 max-w-4xl space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight">Generate</h1>
                <p className="text-white/35 text-sm mt-1">Paste any text and get study material instantly.</p>
            </div>

            {/* Input area */}
            <div className="space-y-3">
                <div className="relative">
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
                        placeholder="Paste your lecture notes, textbook chapter, article..."
                        rows={8}
                        className="w-full bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/40 transition-colors duration-200 resize-none leading-relaxed"
                    />
                    <span className={`absolute bottom-4 right-4 text-xs font-mono transition-colors ${charsLeft < 500 ? 'text-amber-400' : 'text-white/20'}`}>
                        {chars.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                        <span className="text-red-400 text-sm mt-0.5">✕</span>
                        <div>
                            <p className="text-red-400 text-sm font-semibold">Generation failed</p>
                            <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={loading || !text.trim()}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>✦ Generate</>
                    )}
                </button>
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-5">

                    {/* Tab selector */}
                    <div className="flex gap-2 flex-wrap">
                        {tabs.map(({ key, label, icon }) => {
                            const locked  = isLocked(key);
                            const active  = tab === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => !locked && setTab(key)}
                                    disabled={locked}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                        ${active  ? 'bg-violet-600 text-white'
                                                  : locked
                                                      ? 'border border-white/6 text-white/20 cursor-not-allowed'
                                                      : 'border border-white/10 text-white/50 hover:border-white/25 hover:text-white'}`}
                                >
                                    <span>{icon}</span>
                                    {label}
                                    {locked && (
                                        <span className="text-[10px] bg-violet-500/15 border border-violet-500/25 text-violet-400 px-1.5 py-0.5 rounded-md font-bold">
                                            PRO
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div>
                        {/* Summary */}
                        {tab === 'summary' && result.summary && (
                            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                                <p className="text-[10px] text-white/25 uppercase tracking-wider font-mono mb-4">Summary</p>
                                <p className="text-white/70 text-sm leading-[1.85] whitespace-pre-wrap">{result.summary}</p>
                            </div>
                        )}

                        {/* Quiz */}
                        {tab === 'test' && result.test && result.test.length > 0 && (
                            <QuizView questions={result.test} />
                        )}

                        {/* Flashcards */}
                        {tab === 'flashcards' && result.flashcards && result.flashcards.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-white/25 text-xs">Click any card to reveal the answer</p>
                                <FlashcardView cards={result.flashcards} />
                            </div>
                        )}

                        {/* Development */}
                        {tab === 'development' && result.development && result.development.length > 0 && (
                            <div className="space-y-3">
                                {result.development.map((q, i) => (
                                    <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                                        <p className="text-violet-400 text-xs font-mono mb-2">Question {i + 1}</p>
                                        <p className="text-white/75 text-sm leading-relaxed">{q}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}