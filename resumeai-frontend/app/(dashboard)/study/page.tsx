'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../services/api';
import Link from 'next/link';

type Flashcard = { front: string; back: string };
type CardState = 'idle' | 'flipped' | 'known' | 'learning';

type StudyCard = {
    id:           string;  // generationId_cardIndex
    generationId: string;
    title:        string;
    front:        string;
    back:         string;
    state:        CardState;
    nextReview:   number;   // timestamp ms
    interval:     number;   // días hasta próximo repaso
    easeFactor:   number;   // multiplicador SM-2
    reps:         number;
};

// SM-2 simplificado
function updateCard(card: StudyCard, quality: 0 | 3 | 5): StudyCard {
    const now = Date.now();
    let { interval, easeFactor, reps } = card;

    if (quality < 3) {
        // Fallido — resetear
        reps = 0; interval = 1;
    } else {
        if (reps === 0)      interval = 1;
        else if (reps === 1) interval = 6;
        else                 interval = Math.round(interval * easeFactor);

        easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        reps++;
    }

    return {
        ...card,
        interval,
        easeFactor,
        reps,
        state:      quality < 3 ? 'learning' : 'known',
        nextReview: now + interval * 24 * 60 * 60 * 1000
    };
}

// Persistencia en localStorage
const STORAGE_KEY = 'resumeai_study_cards';

function loadProgress(): Record<string, Partial<StudyCard>> {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
}

function saveProgress(cards: StudyCard[]) {
    const data: Record<string, Partial<StudyCard>> = {};
    cards.forEach(c => {
        data[c.id] = { interval: c.interval, easeFactor: c.easeFactor, reps: c.reps, nextReview: c.nextReview, state: c.state };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ── Study card UI ── */
function CardFace({ card, onRate }: { card: StudyCard; onRate: (q: 0 | 3 | 5) => void }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className="space-y-6">
            {/* Card */}
            <div
                onClick={() => !flipped && setFlipped(true)}
                className={`min-h-[240px] bg-white/[0.03] border rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
                    ${flipped ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/8 hover:border-white/20'}`}
            >
                {!flipped ? (
                    <div className="space-y-4">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">Term</span>
                        <p className="text-white text-2xl font-bold leading-relaxed">{card.front}</p>
                        <p className="text-white/20 text-xs mt-6">Click to reveal answer</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <span className="text-[10px] text-violet-400/60 uppercase tracking-widest font-mono">Answer</span>
                        <p className="text-white/80 text-lg leading-relaxed">{card.back}</p>
                    </div>
                )}
            </div>

            {/* Rating buttons (only visible when flipped) */}
            {flipped && (
                <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => onRate(0)}
                        className="py-3 rounded-xl border border-red-500/25 bg-red-500/8 text-red-400 hover:bg-red-500/15 transition-all text-sm font-semibold">
                        <span className="block text-lg mb-0.5">✗</span>
                        Again
                    </button>
                    <button onClick={() => onRate(3)}
                        className="py-3 rounded-xl border border-amber-500/25 bg-amber-500/8 text-amber-400 hover:bg-amber-500/15 transition-all text-sm font-semibold">
                        <span className="block text-lg mb-0.5">〜</span>
                        Hard
                    </button>
                    <button onClick={() => onRate(5)}
                        className="py-3 rounded-xl border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15 transition-all text-sm font-semibold">
                        <span className="block text-lg mb-0.5">✓</span>
                        Easy
                    </button>
                </div>
            )}

            {!flipped && (
                <button onClick={() => setFlipped(true)}
                    className="w-full py-3 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all text-sm">
                    Reveal answer →
                </button>
            )}
        </div>
    );
}

/* ── Done screen ── */
function SessionDone({ known, learning, total, onRestart }: { known: number; learning: number; total: number; onRestart: () => void }) {
    const pct = Math.round((known / total) * 100);
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl">
                {pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}
            </div>
            <div>
                <h2 className="text-3xl font-black tracking-tight">Session complete!</h2>
                <p className="text-white/40 text-sm mt-2">You reviewed {total} card{total !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-emerald-300">{known}</p>
                    <p className="text-emerald-400/60 text-xs mt-1">Known</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-red-300">{learning}</p>
                    <p className="text-red-400/60 text-xs mt-1">Learning</p>
                </div>
            </div>
            <div className="flex gap-3">
                {learning > 0 && (
                    <button onClick={onRestart}
                        className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
                        Review {learning} again →
                    </button>
                )}
                <Link href="/generate"
                    className="px-6 py-2.5 rounded-xl border border-white/12 text-white/50 hover:text-white hover:border-white/25 text-sm transition-all">
                    Generate more
                </Link>
            </div>
        </div>
    );
}

/* ── Main page ── */
export default function StudyPage() {
    const [allCards, setAllCards]   = useState<StudyCard[]>([]);
    const [queue, setQueue]         = useState<StudyCard[]>([]);
    const [current, setCurrent]     = useState(0);
    const [done, setDone]           = useState(false);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [sessionStats, setSessionStats] = useState({ known: 0, learning: 0 });
    const [key, setKey]             = useState(0); // fuerza re-render de CardFace al cambiar de carta

    const loadCards = useCallback(async () => {
        setLoading(true); setError('');
        try {
            // Cargar todas las generaciones y extraer flashcards
            const res = await api('/generation?limit=50');
            const generations = res.data as any[];

            // Para cada generación, cargar el detalle para obtener las flashcards
            const detailRequests = generations.slice(0, 20).map((g: any) =>
                api(`/generation/${g._id}`).catch(() => null)
            );
            const details = await Promise.all(detailRequests);

            const progress = loadProgress();
            const now = Date.now();

            const cards: StudyCard[] = [];
            details.forEach(detail => {
                if (!detail?.data) return;
                const g = detail.data;
                const flashcards: Flashcard[] = g.result?.flashcards || [];
                flashcards.forEach((card, idx) => {
                    if (!card.front || !card.back) return;
                    const id = `${g._id}_${idx}`;
                    const saved = progress[id];
                    cards.push({
                        id,
                        generationId: g._id,
                        title:        g.title || 'Study session',
                        front:        card.front,
                        back:         card.back,
                        state:        (saved?.state as CardState) || 'idle',
                        nextReview:   saved?.nextReview || now,
                        interval:     saved?.interval  || 1,
                        easeFactor:   saved?.easeFactor || 2.5,
                        reps:         saved?.reps       || 0
                    });
                });
            });

            setAllCards(cards);

            // Queue: cartas que son nuevas o que hay que repasar hoy
            const due = cards.filter(c => c.nextReview <= now || c.state === 'idle');
            setQueue(due.slice(0, 20)); // máximo 20 por sesión
            setCurrent(0);
            setDone(due.length === 0);
            setSessionStats({ known: 0, learning: 0 });
        } catch {
            setError('Could not load flashcards.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadCards(); }, [loadCards]);

    const handleRate = (quality: 0 | 3 | 5) => {
        const card    = queue[current];
        const updated = updateCard(card, quality);

        // Actualizar en allCards y guardar
        const newAll = allCards.map(c => c.id === card.id ? updated : c);
        setAllCards(newAll);
        saveProgress(newAll);

        setSessionStats(prev => ({
            known:    prev.known    + (quality >= 3 ? 1 : 0),
            learning: prev.learning + (quality < 3  ? 1 : 0)
        }));

        setKey(k => k + 1); // re-render la carta

        if (current + 1 >= queue.length) {
            setDone(true);
        } else {
            setCurrent(c => c + 1);
        }
    };

    const handleRestart = () => {
        // Poner las cartas "learning" de vuelta en la cola
        const now     = Date.now();
        const reDue   = allCards.filter(c => c.state === 'learning' && c.nextReview <= now);
        setQueue(reDue);
        setCurrent(0);
        setDone(reDue.length === 0);
        setSessionStats({ known: 0, learning: 0 });
        setKey(k => k + 1);
    };

    if (loading) return (
        <div className="p-8 space-y-6 max-w-2xl">
            <div className="h-8 w-36 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
        </div>
    );

    if (error) return (
        <div className="p-8">
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm inline-block">{error}</div>
        </div>
    );

    if (allCards.length === 0) return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-3xl font-black tracking-tight mb-2">Study mode</h1>
            <p className="text-white/35 text-sm mb-8">Spaced repetition flashcards from all your sessions.</p>
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/[0.02] border border-white/8 rounded-2xl">
                <div className="text-4xl mb-4">🧠</div>
                <p className="text-white font-semibold mb-2">No flashcards yet</p>
                <p className="text-white/35 text-sm mb-6">Generate study material first to start reviewing flashcards here.</p>
                <Link href="/generate" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    ✦ Generate now
                </Link>
            </div>
        </div>
    );

    const dueCount   = allCards.filter(c => c.nextReview <= Date.now() || c.state === 'idle').length;
    const knownCount = allCards.filter(c => c.state === 'known').length;

    return (
        <div className="p-8 max-w-2xl space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Study mode</h1>
                    <p className="text-white/35 text-sm mt-1">Spaced repetition · {allCards.length} cards total</p>
                </div>
                <div className="flex gap-3 text-center">
                    <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2">
                        <p className="text-lg font-black text-violet-400">{dueCount}</p>
                        <p className="text-white/30 text-[10px]">due today</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2">
                        <p className="text-lg font-black text-emerald-400">{knownCount}</p>
                        <p className="text-white/30 text-[10px]">mastered</p>
                    </div>
                </div>
            </div>

            {done ? (
                <SessionDone
                    known={sessionStats.known}
                    learning={sessionStats.learning}
                    total={queue.length}
                    onRestart={handleRestart}
                />
            ) : (
                <div className="space-y-4">
                    {/* Progress */}
                    <div className="flex items-center justify-between text-xs text-white/30">
                        <span className="truncate max-w-[200px]">{queue[current]?.title}</span>
                        <span>{current + 1} / {queue.length}</span>
                    </div>
                    <div className="w-full bg-white/6 h-1 rounded-full overflow-hidden">
                        <div className="bg-violet-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${((current) / queue.length) * 100}%` }} />
                    </div>

                    {/* Card */}
                    <CardFace
                        key={key}
                        card={queue[current]}
                        onRate={handleRate}
                    />
                </div>
            )}

            {/* All cards overview */}
            {!done && (
                <details className="group">
                    <summary className="cursor-pointer text-white/25 hover:text-white/50 text-xs uppercase tracking-wider font-medium transition-colors list-none flex items-center gap-2">
                        <span className="group-open:rotate-90 transition-transform inline-block">›</span>
                        All cards overview ({allCards.length})
                    </summary>
                    <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                        {allCards.map(card => (
                            <div key={card.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02]">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                    card.state === 'known'    ? 'bg-emerald-400' :
                                    card.state === 'learning' ? 'bg-red-400' :
                                    card.reps > 0             ? 'bg-amber-400' : 'bg-white/20'
                                }`} />
                                <p className="text-white/50 text-xs truncate flex-1">{card.front}</p>
                                <span className="text-white/20 text-[10px] shrink-0">
                                    {card.reps > 0 ? `${card.interval}d` : 'new'}
                                </span>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
}