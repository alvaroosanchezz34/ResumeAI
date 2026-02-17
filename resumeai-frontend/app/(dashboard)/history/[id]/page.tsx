'use client';

import { useEffect, useState, use } from 'react';
import { api } from '../../../../services/api';
import Link from 'next/link';

type Question = { question: string; options: string[]; correctAnswer: number };
type Flashcard = { front: string; back: string };
type Result = {
    summary?: string;
    test?: Question[];
    development?: string[];
    flashcards?: Flashcard[];
};
type Tab = 'summary' | 'test' | 'flashcards' | 'development';

/* ── Quiz (mismo que en Generate) ── */
function QuizView({ questions }: { questions: Question[] }) {
    const [answers, setAnswers]   = useState<Record<number, number>>({});
    const [revealed, setRevealed] = useState<Record<number, boolean>>({});

    const pick = (qi: number, oi: number) => {
        if (revealed[qi]) return;
        setAnswers(prev => ({ ...prev, [qi]: oi }));
        setRevealed(prev => ({ ...prev, [qi]: true }));
    };

    const score = Object.keys(revealed).filter(k => answers[+k] === questions[+k].correctAnswer).length;
    const total = Object.keys(revealed).length;

    return (
        <div className="space-y-5">
            {total > 0 && (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-white/40">{total} of {questions.length} answered</span>
                    <div className="flex-1 bg-white/6 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${(total / questions.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-semibold text-violet-400">{score}/{total} correct</span>
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

                            let cls = 'border border-white/8 text-white/55 hover:border-white/20 hover:text-white cursor-pointer';
                            if (isRevealed) {
                                if (isCorrect)     cls = 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-300 cursor-default';
                                else if (isPicked) cls = 'border border-red-500/60 bg-red-500/10 text-red-300 cursor-default';
                                else               cls = 'border border-white/5 text-white/20 cursor-default';
                            }

                            return (
                                <button
                                    key={oi}
                                    onClick={() => pick(qi, oi)}
                                    disabled={!!isRevealed}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${cls}`}
                                >
                                    <span className="text-white/25 mr-2 font-mono text-xs">{String.fromCharCode(65 + oi)}.</span>
                                    {opt}
                                    {isRevealed && isCorrect  && <span className="float-right text-emerald-400 text-xs font-semibold">✓ Correct</span>}
                                    {isRevealed && isPicked && !isCorrect && <span className="float-right text-red-400 text-xs font-semibold">✗ Wrong</span>}
                                </button>
                            );
                        })}
                    </div>
                    {!revealed[qi] && <p className="text-white/20 text-xs">Click an option to answer</p>}
                </div>
            ))}
        </div>
    );
}

/* ── Flashcards con flip ── */
function FlashcardView({ cards }: { cards: Flashcard[] }) {
    const [flipped, setFlipped] = useState<Record<number, boolean>>({});

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {cards.map((card, i) => (
                <button
                    key={i}
                    onClick={() => setFlipped(prev => ({ ...prev, [i]: !prev[i] }))}
                    className="group bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-0.5 min-h-[110px] overflow-hidden relative"
                >
                    <span className="absolute top-3 right-3 text-[10px] text-white/20 uppercase tracking-wider">
                        {flipped[i] ? 'Answer' : 'Term'} · flip
                    </span>
                    {!flipped[i]
                        ? <p className="font-semibold text-white leading-relaxed mt-3">{card.front}</p>
                        : <p className="text-white/60 text-sm leading-relaxed mt-3">{card.back}</p>
                    }
                </button>
            ))}
        </div>
    );
}

/* ── Skeleton ── */
function Skeleton() {
    return (
        <div className="p-8 space-y-6">
            <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-4 w-64 bg-white/4 rounded-xl animate-pulse" />
            <div className="h-40 bg-white/4 rounded-2xl animate-pulse" />
            <div className="h-64 bg-white/4 rounded-2xl animate-pulse" />
        </div>
    );
}

/* ── Main ── */
export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [generation, setGeneration] = useState<any>(null);
    const [tab, setTab]               = useState<Tab>('summary');
    const [error, setError]           = useState('');

    useEffect(() => {
        api(`/generation/${id}`)
            .then(res => {
                setGeneration(res.data);
                // Auto-select first tab that has content
                const r: Result = res.data.result;
                if (r.summary)     setTab('summary');
                else if (r.test?.length)        setTab('test');
                else if (r.flashcards?.length)  setTab('flashcards');
                else if (r.development?.length) setTab('development');
            })
            .catch(() => setError('Could not load this generation.'));
    }, [id]);

    if (error) return (
        <div className="p-8">
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm inline-block">
                {error}
            </div>
        </div>
    );

    if (!generation) return <Skeleton />;

    const result: Result = generation.result;
    const createdAt = new Date(generation.createdAt);

    const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
        { key: 'summary',     label: 'Summary',    icon: '📄', count: result.summary ? 1 : 0 },
        { key: 'test',        label: 'Quiz',        icon: '📝', count: result.test?.length },
        { key: 'flashcards',  label: 'Flashcards', icon: '🃏', count: result.flashcards?.length },
        { key: 'development', label: 'Open Q&A',   icon: '💬', count: result.development?.length },
    ].filter(t => (t.count ?? 0) > 0);

    return (
        <div className="p-8 max-w-4xl space-y-7">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Link
                        href="/history"
                        className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4"
                    >
                        ← Back to history
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight capitalize">
                        {generation.type === 'full' ? 'Full generation' : generation.type}
                    </h1>
                    <p className="text-white/30 text-sm mt-1">
                        {createdAt.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {createdAt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Content counts */}
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    {result.summary && (
                        <span className="text-xs bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-lg">📄 Summary</span>
                    )}
                    {result.test?.length ? (
                        <span className="text-xs bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-lg">📝 {result.test.length} questions</span>
                    ) : null}
                    {result.flashcards?.length ? (
                        <span className="text-xs bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-lg">🃏 {result.flashcards.length} cards</span>
                    ) : null}
                    {result.development?.length ? (
                        <span className="text-xs bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-lg">💬 {result.development.length} Q&A</span>
                    ) : null}
                </div>
            </div>

            {/* Original text (collapsed) */}
            {generation.originalText && (
                <details className="group">
                    <summary className="cursor-pointer text-white/25 hover:text-white/50 text-xs uppercase tracking-wider font-medium transition-colors list-none flex items-center gap-2">
                        <span className="group-open:rotate-90 transition-transform inline-block">›</span>
                        View original text
                    </summary>
                    <div className="mt-3 bg-white/[0.02] border border-white/6 rounded-2xl p-5">
                        <p className="text-white/40 text-sm leading-relaxed whitespace-pre-wrap line-clamp-10">
                            {generation.originalText}
                        </p>
                    </div>
                </details>
            )}

            {/* Tab selector */}
            {tabs.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {tabs.map(({ key, label, icon, count }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                ${tab === key
                                    ? 'bg-violet-600 text-white'
                                    : 'border border-white/10 text-white/45 hover:border-white/25 hover:text-white'}`}
                        >
                            <span>{icon}</span>
                            {label}
                            {count && count > 1 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold
                                    ${tab === key ? 'bg-white/20 text-white' : 'bg-white/6 text-white/30'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            <div>
                {tab === 'summary' && result.summary && (
                    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                        <p className="text-[10px] text-white/25 uppercase tracking-wider font-mono mb-4">Summary</p>
                        <p className="text-white/70 text-sm leading-[1.85] whitespace-pre-wrap">{result.summary}</p>
                    </div>
                )}

                {tab === 'test' && result.test && result.test.length > 0 && (
                    <QuizView questions={result.test} />
                )}

                {tab === 'flashcards' && result.flashcards && result.flashcards.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-white/25 text-xs">Click any card to reveal the answer</p>
                        <FlashcardView cards={result.flashcards} />
                    </div>
                )}

                {tab === 'development' && result.development && result.development.length > 0 && (
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
        </div>
    );
}