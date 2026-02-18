'use client';

import { useEffect, useState, use } from 'react';
import { api } from '../../../../services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Question = { question: string; options: string[]; correctAnswer: number };
type Flashcard = { front: string; back: string };
type Result = {
    summary?: string;
    test?: Question[];
    development?: string[];
    flashcards?: Flashcard[];
};
type Tab = 'summary' | 'test' | 'flashcards' | 'development';

const LANG_FLAG: Record<string, string> = {
    es: '🇪🇸', en: '🇺🇸', fr: '🇫🇷', de: '🇩🇪',
    it: '🇮🇹', pt: '🇵🇹', ca: '🏴', nl: '🇳🇱', ru: '🇷🇺'
};

// ── Share Button ──────────────────────────────────────────────────────────────
function ShareButton({ generationId }: { generationId: string }) {
    const [isPublic, setIsPublic]   = useState(false);
    const [shareId, setShareId]     = useState<string | null>(null);
    const [loading, setLoading]     = useState(false);
    const [copied, setCopied]       = useState(false);

    const shareUrl = shareId
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareId}`
        : null;

    const enable = async () => {
        setLoading(true);
        try {
            const res = await api(`/generation/${generationId}/share`, { method: 'POST' });
            setShareId(res.shareId);
            setIsPublic(true);
        } catch (err: any) {
            alert(err.message || 'Failed to create share link');
        } finally {
            setLoading(false);
        }
    };

    const disable = async () => {
        setLoading(true);
        try {
            await api(`/generation/${generationId}/share`, { method: 'DELETE' });
            setIsPublic(false);
        } catch (err: any) {
            alert(err.message || 'Failed to disable share link');
        } finally {
            setLoading(false);
        }
    };

    const copy = async () => {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isPublic) {
        return (
            <button
                onClick={enable}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/25 text-sm transition-all disabled:opacity-40"
            >
                {loading ? '…' : <><span>🔗</span> Share</>}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* URL del link */}
            <div className="flex items-center gap-2 bg-white/[0.04] border border-violet-500/25 rounded-xl px-3 py-1.5">
                <span className="text-violet-400 text-xs">🔗</span>
                <span className="text-white/50 text-xs font-mono truncate max-w-[180px]">
                    /share/{shareId?.slice(0, 8)}…
                </span>
            </div>

            {/* Copiar */}
            <button
                onClick={copy}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all
                    ${copied
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/10 text-white/40 hover:text-white hover:border-white/25'}`}
            >
                {copied ? '✓ Copied!' : 'Copy link'}
            </button>

            {/* Desactivar */}
            <button
                onClick={disable}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/8 text-xs transition-all disabled:opacity-40"
            >
                {loading ? '…' : 'Disable'}
            </button>
        </div>
    );
}

function QuizView({ questions }: { questions: Question[] }) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [revealed, setRevealed] = useState<Record<number, boolean>>({});
    const [finished, setFinished] = useState(false);

    const pick = (qi: number, oi: number) => {
        if (revealed[qi]) return;
        const newAnswers = { ...answers, [qi]: oi };
        const newRevealed = { ...revealed, [qi]: true };
        setAnswers(newAnswers);
        setRevealed(newRevealed);
        if (Object.keys(newRevealed).length === questions.length) setFinished(true);
    };

    const score = Object.keys(revealed).filter(k => answers[+k] === questions[+k].correctAnswer).length;
    const total = Object.keys(revealed).length;
    const reset = () => { setAnswers({}); setRevealed({}); setFinished(false); };

    return (
        <div className="space-y-5">
            {total > 0 && (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-white/40">{total} of {questions.length} answered</span>
                    <div className="flex-1 bg-white/6 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-violet-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(total / questions.length) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-violet-400">{score}/{total} ✓</span>
                </div>
            )}

            {finished && (
                <div className={`rounded-2xl p-5 border flex items-center justify-between ${score === questions.length ? 'bg-emerald-500/10 border-emerald-500/25'
                        : score >= questions.length * 0.6 ? 'bg-amber-500/10 border-amber-500/25'
                            : 'bg-red-500/10 border-red-500/25'
                    }`}>
                    <div>
                        <p className={`font-bold text-lg ${score === questions.length ? 'text-emerald-300' : score >= questions.length * 0.6 ? 'text-amber-300' : 'text-red-300'}`}>
                            {score === questions.length ? '🎉 Perfect score!' : `${score} / ${questions.length} correct`}
                        </p>
                        <p className="text-white/40 text-sm mt-0.5">
                            {score === questions.length ? 'You nailed every question.' : `You got ${questions.length - score} wrong. Try again to improve.`}
                        </p>
                    </div>
                    <button onClick={reset} className="px-4 py-2 rounded-xl border border-white/12 text-white/50 hover:text-white hover:border-white/25 text-sm transition-all">
                        Retry ↺
                    </button>
                </div>
            )}

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
                            let cls = 'border border-white/8 text-white/55 hover:border-white/20 hover:text-white cursor-pointer';
                            if (isRevealed) {
                                if (isCorrect) cls = 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-300 cursor-default';
                                else if (isPicked) cls = 'border border-red-500/60 bg-red-500/10 text-red-300 cursor-default';
                                else cls = 'border border-white/5 text-white/20 cursor-default';
                            }
                            return (
                                <button key={oi} onClick={() => pick(qi, oi)} disabled={!!isRevealed}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${cls}`}>
                                    <span className="text-white/25 mr-2 font-mono text-xs">{String.fromCharCode(65 + oi)}.</span>
                                    {opt}
                                    {isRevealed && isCorrect && <span className="float-right text-emerald-400 text-xs font-semibold">✓ Correct</span>}
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

function FlashcardView({ cards }: { cards: Flashcard[] }) {
    const [flipped, setFlipped] = useState<Record<number, boolean>>({});
    const [known, setKnown] = useState<Record<number, boolean>>({});

    const knownCount = Object.values(known).filter(Boolean).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-white/30">
                <span>Click to flip · Mark cards you know</span>
                <span className="text-violet-400 font-semibold">{knownCount}/{cards.length} known</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {cards.map((card, i) => (
                    <div key={i} className={`group relative rounded-2xl transition-all duration-300 ${known[i] ? 'opacity-50 scale-[0.98]' : ''}`}>
                        <button
                            onClick={() => setFlipped(prev => ({ ...prev, [i]: !prev[i] }))}
                            className="w-full bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-0.5 min-h-[110px] overflow-hidden relative"
                        >
                            <span className="absolute top-3 right-3 text-[10px] text-white/20 uppercase tracking-wider">
                                {flipped[i] ? 'Answer' : 'Term'} · flip
                            </span>
                            {!flipped[i]
                                ? <p className="font-semibold text-white leading-relaxed mt-3">{card.front}</p>
                                : <p className="text-white/60 text-sm leading-relaxed mt-3">{card.back}</p>
                            }
                        </button>
                        {flipped[i] && (
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => setKnown(prev => ({ ...prev, [i]: false }))}
                                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${known[i] === false ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-white/8 text-white/30 hover:border-red-500/30 hover:text-red-400'}`}>
                                    ✗ Still learning
                                </button>
                                <button onClick={() => setKnown(prev => ({ ...prev, [i]: true }))}
                                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${known[i] === true ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/8 text-white/30 hover:border-emerald-500/30 hover:text-emerald-400'}`}>
                                    ✓ Got it
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

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

export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [generation, setGeneration] = useState<any>(null);
    const [tab, setTab] = useState<Tab>('summary');
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        api(`/generation/${id}`)
            .then(res => {
                setGeneration(res.data);
                const r: Result = res.data.result;
                if (r.summary) setTab('summary');
                else if (r.test?.length) setTab('test');
                else if (r.flashcards?.length) setTab('flashcards');
                else if (r.development?.length) setTab('development');
            })
            .catch(() => setError('Could not load this generation.'));
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Delete this study session?')) return;
        setDeleting(true);
        try {
            await api(`/generation/${id}`, { method: 'DELETE' });
            router.push('/history');
        } catch {
            setDeleting(false);
        }
    };

    if (error) return (
        <div className="p-8">
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm inline-block">{error}</div>
        </div>
    );

    if (!generation) return <Skeleton />;

    const result: Result = generation.result;
    const createdAt = new Date(generation.createdAt);
    const langFlag = generation.language ? LANG_FLAG[generation.language] : null;

    const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
        { key: 'summary', label: 'Summary', icon: '📄', count: result.summary ? 1 : 0 },
        { key: 'test', label: 'Quiz', icon: '📝', count: result.test?.length },
        { key: 'flashcards', label: 'Flashcards', icon: '🃏', count: result.flashcards?.length },
        { key: 'development', label: 'Open Q&A', icon: '💬', count: result.development?.length },
    ].filter(t => (t.count ?? 0) > 0);

    return (
        <div className="p-8 max-w-4xl space-y-7">
            <Link href="/history" className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                ← Back to history
            </Link>

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-black tracking-tight truncate">
                            {generation.title || 'Study session'}
                        </h1>
                        {langFlag && <span className="text-2xl shrink-0" title={generation.language}>{langFlag}</span>}
                    </div>
                    <p className="text-white/30 text-sm">
                        {createdAt.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {createdAt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {result.summary && <span className="text-xs bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-lg">📄 Summary</span>}
                    {result.test?.length ? <span className="text-xs bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-lg">📝 {result.test.length}q</span> : null}
                    {result.flashcards?.length ? <span className="text-xs bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-lg">🃏 {result.flashcards.length}</span> : null}
                    {result.development?.length ? <span className="text-xs bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-lg">💬 {result.development.length}</span> : null}
                    <ShareButton generationId={id} />
                    <button onClick={handleDelete} disabled={deleting}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete session">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {generation.originalText && (
                <details className="group">
                    <summary className="cursor-pointer text-white/25 hover:text-white/50 text-xs uppercase tracking-wider font-medium transition-colors list-none flex items-center gap-2">
                        <span className="group-open:rotate-90 transition-transform inline-block">›</span>
                        View original text
                    </summary>
                    <div className="mt-3 bg-white/[0.02] border border-white/6 rounded-2xl p-5">
                        <p className="text-white/40 text-sm leading-relaxed whitespace-pre-wrap">{generation.originalText}</p>
                    </div>
                </details>
            )}

            {tabs.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {tabs.map(({ key, label, icon, count }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                ${tab === key ? 'bg-violet-600 text-white' : 'border border-white/10 text-white/45 hover:border-white/25 hover:text-white'}`}>
                            <span>{icon}</span>
                            {label}
                            {count && count > 1 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${tab === key ? 'bg-white/20 text-white' : 'bg-white/6 text-white/30'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div>
                {tab === 'summary' && result.summary && (
                    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                        <p className="text-[10px] text-white/25 uppercase tracking-wider font-mono mb-4">Summary</p>
                        <p className="text-white/70 text-sm leading-[1.85] whitespace-pre-wrap">{result.summary}</p>
                    </div>
                )}
                {tab === 'test' && result.test && result.test.length > 0 && <QuizView questions={result.test} />}
                {tab === 'flashcards' && result.flashcards && result.flashcards.length > 0 && <FlashcardView cards={result.flashcards} />}
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

            <div className="border-t border-white/6 pt-6 flex items-center justify-between">
                <p className="text-white/25 text-xs">Want to study this material again?</p>
                <Link href="/generate" className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
                    New generation →
                </Link>
            </div>
        </div>
    );
}