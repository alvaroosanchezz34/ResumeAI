'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const LANG_FLAG: Record<string, string> = {
    es: '🇪🇸', en: '🇺🇸', fr: '🇫🇷', de: '🇩🇪',
    it: '🇮🇹', pt: '🇵🇹', ca: '🏴', nl: '🇳🇱', ru: '🇷🇺'
};

type Question = { question: string; options: string[]; correctAnswer: number };
type Flashcard = { front: string; back: string };
type Result = {
    summary?: string;
    test?: Question[];
    flashcards?: Flashcard[];
    development?: string[];
};
type Tab = 'summary' | 'test' | 'flashcards' | 'development';

function QuizView({ questions }: { questions: Question[] }) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [revealed, setRevealed] = useState<Record<number, boolean>>({});

    const pick = (qi: number, oi: number) => {
        if (revealed[qi]) return;
        setAnswers(p => ({ ...p, [qi]: oi }));
        setRevealed(p => ({ ...p, [qi]: true }));
    };

    return (
        <div className="space-y-5">
            {questions.map((q, qi) => (
                <div key={qi} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
                    <p className="text-white font-semibold leading-relaxed">
                        <span className="text-violet-400 mr-2">{qi + 1}.</span>{q.question}
                    </p>
                    <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                            const isRevealed = revealed[qi];
                            const isPicked = answers[qi] === oi;
                            const isCorrect = q.correctAnswer === oi;
                            let cls = 'border border-white/8 text-white/60 hover:border-white/20 hover:text-white cursor-pointer';
                            if (isRevealed) {
                                if (isCorrect) cls = 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-300 cursor-default';
                                else if (isPicked) cls = 'border border-red-500/60 bg-red-500/10 text-red-300 cursor-default';
                                else cls = 'border border-white/5 text-white/25 cursor-default';
                            }
                            return (
                                <button key={oi} onClick={() => pick(qi, oi)} disabled={!!isRevealed}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${cls}`}>
                                    <span className="text-white/30 mr-2 font-mono text-xs">{String.fromCharCode(65 + oi)}.</span>
                                    {opt}
                                    {isRevealed && isCorrect && <span className="float-right text-emerald-400 text-xs font-semibold">✓ Correct</span>}
                                    {isRevealed && isPicked && !isCorrect && <span className="float-right text-red-400 text-xs font-semibold">✗ Wrong</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

function FlashcardView({ cards }: { cards: Flashcard[] }) {
    const [flipped, setFlipped] = useState<Record<number, boolean>>({});

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {cards.map((card, i) => (
                <button key={i} onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))}
                    className="bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-0.5 min-h-[110px] relative">
                    <span className="absolute top-3 right-3 text-[10px] text-white/20 uppercase tracking-wider">
                        {flipped[i] ? 'Answer' : 'Term'} · flip
                    </span>
                    {!flipped[i]
                        ? <p className="font-semibold text-white leading-relaxed mt-3">{card.front}</p>
                        : <p className="text-white/60 text-sm leading-relaxed mt-3">{card.back}</p>}
                </button>
            ))}
        </div>
    );
}

export default function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
    const { shareId } = use(params);

    const [data, setData] = useState<any>(null);
    const [tab, setTab] = useState<Tab>('summary');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/generation/public/${shareId}`)
            .then(res => res.json())
            .then(json => {
                if (!json.success) throw new Error(json.message || 'Not found');
                setData(json.data);
                const r = json.data.result;
                if (r.summary) setTab('summary');
                else if (r.test?.length) setTab('test');
                else if (r.flashcards?.length) setTab('flashcards');
                else if (r.development?.length) setTab('development');
            })
            .catch(err => setError(err.message || 'This link is no longer active.'))
            .finally(() => setLoading(false));
    }, [shareId]);

    if (loading) return (
        <div className="min-h-screen bg-[#0e0e14] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0e0e14] flex flex-col items-center justify-center text-center px-6 gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center text-3xl">🔗</div>
            <div>
                <h1 className="text-white text-xl font-black mb-2">Link not available</h1>
                <p className="text-white/40 text-sm">{error}</p>
            </div>
            <Link href="/" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Go to ResumeAI →
            </Link>
        </div>
    );

    const result: Result = data.result;
    const langFlag = data.language ? LANG_FLAG[data.language] : null;

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'summary', label: 'Summary', icon: '📄' },
        { key: 'test', label: 'Quiz', icon: '📝' },
        { key: 'flashcards', label: 'Flashcards', icon: '🃏' },
        { key: 'development', label: 'Open Q&A', icon: '💬' },
    ].filter(t => {
        if (t.key === 'summary') return !!result.summary;
        if (t.key === 'test') return (result.test?.length ?? 0) > 0;
        if (t.key === 'flashcards') return (result.flashcards?.length ?? 0) > 0;
        if (t.key === 'development') return (result.development?.length ?? 0) > 0;
        return false;
    });

    return (
        <div className="min-h-screen bg-[#0e0e14] text-white">

            {/* Navbar */}
            <nav className="border-b border-white/6 bg-[#0e0e14] px-6 h-14 flex items-center justify-between sticky top-0 z-50">
                <Link href="/" className="font-black text-lg tracking-tight">
                    Resume<span className="text-violet-400">AI</span>
                </Link>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:block text-white/25 text-xs border border-white/10 px-2.5 py-1 rounded-full">
                        🔗 Shared study material
                    </span>
                    <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">
                        Log in
                    </Link>
                    <Link href="/register"
                        className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        Try for free →
                    </Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-7">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {langFlag && <span className="text-2xl">{langFlag}</span>}
                        <h1 className="text-3xl font-black tracking-tight">
                            {data.title || 'Study material'}
                        </h1>
                    </div>
                    <p className="text-white/30 text-sm">
                        Shared by <span className="text-white/50">{data.author}</span>
                        {' · '}
                        {new Date(data.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {/* Tabs */}
                {tabs.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                        {tabs.map(({ key, label, icon }) => (
                            <button key={key} onClick={() => setTab(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                    ${tab === key
                                        ? 'bg-violet-600 text-white'
                                        : 'border border-white/10 text-white/45 hover:border-white/25 hover:text-white'}`}>
                                <span>{icon}</span>{label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Contenido */}
                <div>
                    {tab === 'summary' && result.summary && (
                        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                            <p className="text-[10px] text-white/25 uppercase tracking-wider font-mono mb-4">Summary</p>
                            <p className="text-white/70 text-sm leading-[1.85] whitespace-pre-wrap">{result.summary}</p>
                        </div>
                    )}
                    {tab === 'test' && result.test && <QuizView questions={result.test} />}
                    {tab === 'flashcards' && result.flashcards && <FlashcardView cards={result.flashcards} />}
                    {tab === 'development' && result.development && (
                        <div className="space-y-3">
                            {result.development.map((q, i) => (
                                <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                                    <p className="text-violet-400 text-xs font-mono mb-2">Question {i + 1}</p>
                                    <p className="text-white/70 text-sm leading-relaxed">{q}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA al final */}
                <div className="border-t border-white/6 pt-8 flex flex-col items-center text-center gap-4">
                    <p className="text-white/40 text-sm">Want to create your own study material?</p>
                    <Link href="/register"
                        className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105">
                        Start for free →
                    </Link>
                    <p className="text-white/20 text-xs">No credit card · 5 free generations per day</p>
                </div>
            </div>
        </div>
    );
}