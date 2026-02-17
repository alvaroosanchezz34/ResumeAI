'use client';

import { useState, useEffect, useRef } from 'react';
import { api, uploadPdf } from '../../../services/api';
import Link from 'next/link';

type Question  = { question: string; options: string[]; correctAnswer: number };
type Flashcard = { front: string; back: string };
type AIResult  = {
    _id?:        string;
    title?:      string;
    language?:   string;
    summary?:    string;
    test?:       Question[];
    development?: string[];
    flashcards?: Flashcard[];
};
type Tab        = 'summary' | 'test' | 'development' | 'flashcards';
type InputMode  = 'text' | 'pdf';

const MAX_CHARS = 8000;

const LANG_FLAG: Record<string, string> = {
    es: '🇪🇸', en: '🇺🇸', fr: '🇫🇷', de: '🇩🇪',
    it: '🇮🇹', pt: '🇵🇹', ca: '🏴', nl: '🇳🇱', ru: '🇷🇺'
};

const LANGUAGES = [
    { code: 'auto', label: 'Auto-detect' },
    { code: 'es',   label: '🇪🇸 Spanish' },
    { code: 'en',   label: '🇺🇸 English' },
    { code: 'fr',   label: '🇫🇷 French' },
    { code: 'de',   label: '🇩🇪 German' },
    { code: 'it',   label: '🇮🇹 Italian' },
    { code: 'pt',   label: '🇵🇹 Portuguese' },
    { code: 'nl',   label: '🇳🇱 Dutch' },
    { code: 'ru',   label: '🇷🇺 Russian' },
];

/* ── Quiz ── */
function QuizView({ questions }: { questions: Question[] }) {
    const [answers, setAnswers]   = useState<Record<number, number>>({});
    const [revealed, setRevealed] = useState<Record<number, boolean>>({});
    const [finished, setFinished] = useState(false);

    const pick = (qi: number, oi: number) => {
        if (revealed[qi]) return;
        const na = { ...answers,  [qi]: oi };
        const nr = { ...revealed, [qi]: true };
        setAnswers(na); setRevealed(nr);
        if (Object.keys(nr).length === questions.length) setFinished(true);
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
                <div className={`rounded-2xl p-5 border flex items-center justify-between ${
                    score === questions.length ? 'bg-emerald-500/10 border-emerald-500/25'
                    : score >= questions.length * 0.6 ? 'bg-amber-500/10 border-amber-500/25'
                    : 'bg-red-500/10 border-red-500/25'}`}>
                    <div>
                        <p className={`font-bold text-lg ${score === questions.length ? 'text-emerald-300' : score >= questions.length * 0.6 ? 'text-amber-300' : 'text-red-300'}`}>
                            {score === questions.length ? '🎉 Perfect score!' : `${score} / ${questions.length} correct`}
                        </p>
                        <p className="text-white/40 text-sm mt-0.5">
                            {score === questions.length ? 'You nailed it.' : 'Try again to improve.'}
                        </p>
                    </div>
                    <button onClick={reset} className="px-4 py-2 rounded-xl border border-white/12 text-white/50 hover:text-white text-sm transition-all">Retry ↺</button>
                </div>
            )}
            {questions.map((q, qi) => (
                <div key={qi} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
                    <p className="text-white font-semibold leading-relaxed"><span className="text-violet-400 mr-2">{qi + 1}.</span>{q.question}</p>
                    <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                            const isRevealed = revealed[qi]; const isPicked = answers[qi] === oi; const isCorrect = q.correctAnswer === oi;
                            let cls = 'border border-white/8 text-white/60 hover:border-white/20 hover:text-white cursor-pointer';
                            if (isRevealed) {
                                if (isCorrect) cls = 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-300 cursor-default';
                                else if (isPicked) cls = 'border border-red-500/60 bg-red-500/10 text-red-300 cursor-default';
                                else cls = 'border border-white/5 text-white/25 cursor-default';
                            }
                            return (
                                <button key={oi} onClick={() => pick(qi, oi)} disabled={!!isRevealed}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${cls}`}>
                                    <span className="text-white/30 mr-2 font-mono text-xs">{String.fromCharCode(65 + oi)}.</span>{opt}
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

/* ── Flashcards ── */
function FlashcardView({ cards }: { cards: Flashcard[] }) {
    const [flipped, setFlipped] = useState<Record<number, boolean>>({});
    const [known, setKnown]     = useState<Record<number, boolean>>({});
    const knownCount = Object.values(known).filter(Boolean).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-white/30">
                <span>Click to flip · Mark what you know</span>
                <span className="text-violet-400 font-semibold">{knownCount}/{cards.length} known</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {cards.map((card, i) => (
                    <div key={i} className={`transition-all duration-300 ${known[i] ? 'opacity-50 scale-[0.98]' : ''}`}>
                        <button onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))}
                            className="w-full bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-0.5 min-h-[120px] overflow-hidden relative">
                            <span className="absolute top-3 right-3 text-[10px] text-white/20 uppercase tracking-wider">{flipped[i] ? 'Answer' : 'Term'} · flip</span>
                            {!flipped[i] ? <p className="font-semibold text-white leading-relaxed mt-3">{card.front}</p>
                                         : <p className="text-white/65 text-sm leading-relaxed mt-3">{card.back}</p>}
                        </button>
                        {flipped[i] && (
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => setKnown(p => ({ ...p, [i]: false }))}
                                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${known[i] === false ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-white/8 text-white/30 hover:border-red-500/30 hover:text-red-400'}`}>
                                    ✗ Still learning
                                </button>
                                <button onClick={() => setKnown(p => ({ ...p, [i]: true }))}
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

/* ── PDF Drop Zone ── */
function PdfDropZone({ onExtracted, disabled }: { onExtracted: (text: string, info: string) => void; disabled: boolean }) {
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;
        if (file.type !== 'application/pdf') { setError('Only PDF files are supported.'); return; }
        setError(''); setLoading(true);
        try {
            const result = await uploadPdf(file);
            const info = `${result.pages} page${result.pages !== 1 ? 's' : ''} · ${result.chars.toLocaleString()} chars${result.truncated ? ' (truncated to 8000)' : ''}`;
            onExtracted(result.text, info);
        } catch (err: any) {
            setError(err.message || 'Failed to extract PDF text.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => !disabled && !loading && inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer
                    ${dragging ? 'border-violet-500/60 bg-violet-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}
                    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {loading ? (
                    <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin w-8 h-8 text-violet-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <p className="text-white/40 text-sm">Extracting text from PDF…</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-2xl">📄</div>
                        <div>
                            <p className="text-white/60 text-sm font-semibold">Drop your PDF here</p>
                            <p className="text-white/25 text-xs mt-1">or click to browse · max 5MB</p>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-red-400 text-xs px-1">{error}</p>}
        </div>
    );
}

/* ── Main page ── */
export default function GeneratePage() {
    const [text, setText]         = useState('');
    const [tab, setTab]           = useState<Tab>('summary');
    const [loading, setLoading]   = useState(false);
    const [result, setResult]     = useState<AIResult | null>(null);
    const [plan, setPlan]         = useState('free');
    const [error, setError]       = useState('');
    const [inputMode, setInputMode] = useState<InputMode>('text');
    const [language, setLanguage] = useState('auto');
    const [pdfInfo, setPdfInfo]   = useState('');

    useEffect(() => {
        api('/auth/me').then(res => setPlan(res.user.plan)).catch(() => {});
    }, []);

    const isLocked = (f: string) => {
        if (['admin', 'premium', 'pro'].includes(plan)) return false;
        return f !== 'summary' && f !== 'flashcards';
    };

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setError(''); setLoading(true); setResult(null);
        try {
            const res = await api('/ai/generate', {
                method: 'POST',
                body: JSON.stringify({
                    text,
                    language: language === 'auto' ? undefined : language
                }),
            });
            setResult(res.data);
            setTab('summary');
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handlePdfExtracted = (extractedText: string, info: string) => {
        setText(extractedText);
        setPdfInfo(info);
        // NO cambiamos inputMode - el usuario ve el banner pero no el textarea
    };

    const handleClearPdf = () => {
        setText('');
        setPdfInfo('');
        setInputMode('pdf');
    };

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'summary',     label: 'Summary',    icon: '📄' },
        { key: 'test',        label: 'Quiz',        icon: '📝' },
        { key: 'flashcards',  label: 'Flashcards', icon: '🃏' },
        { key: 'development', label: 'Open Q&A',   icon: '💬' },
    ];

    const chars     = text.length;
    const charsLeft = MAX_CHARS - chars;

    return (
        <div className="p-8 max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Generate</h1>
                <p className="text-white/35 text-sm mt-1">Paste text or upload a PDF to get study material instantly.</p>
            </div>

            <div className="space-y-4">
                {/* Input mode toggle */}
                <div className="flex items-center gap-1 bg-white/[0.03] border border-white/8 rounded-xl p-1 w-fit">
                    <button onClick={() => { setInputMode('text'); setPdfInfo(''); }}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${inputMode === 'text' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white'}`}>
                        ✏️ Text
                    </button>
                    <button onClick={() => setInputMode('pdf')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${inputMode === 'pdf' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white'}`}>
                        📄 PDF
                    </button>
                </div>

                {/* PDF extracted banner */}
                {pdfInfo && (
                    <div className="flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
                        <span className="text-emerald-400 text-lg">✓</span>
                        <div className="flex-1">
                            <p className="text-emerald-300 text-sm font-semibold">PDF extracted successfully</p>
                            <p className="text-emerald-400/70 text-xs mt-0.5">{pdfInfo}</p>
                        </div>
                        <button onClick={handleClearPdf}
                            className="text-white/30 hover:text-white/60 text-sm transition-colors">
                            ✕
                        </button>
                    </div>
                )}

                {/* Input area */}
                {inputMode === 'pdf' && !pdfInfo ? (
                    <PdfDropZone onExtracted={handlePdfExtracted} disabled={loading} />
                ) : inputMode === 'text' ? (
                    <div className="relative">
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
                            placeholder="Paste your lecture notes, textbook chapter, article…"
                            rows={8}
                            className="w-full bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/40 transition-colors duration-200 resize-none leading-relaxed"
                        />
                        <span className={`absolute bottom-4 right-4 text-xs font-mono transition-colors ${charsLeft < 500 ? 'text-amber-400' : 'text-white/20'}`}>
                            {chars.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                        </span>
                    </div>
                ) : null}

                {/* Language selector + Generate button */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="appearance-none bg-white/[0.03] border border-white/8 text-white/60 text-sm px-3 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-violet-500/40 transition-colors cursor-pointer hover:border-white/15"
                        >
                            {LANGUAGES.map(l => (
                                <option key={l.code} value={l.code} className="bg-[#1a1a2e] text-white">
                                    {l.label}
                                </option>
                            ))}
                        </select>
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none text-xs">▾</span>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
                            <span className="text-red-400 text-xs">✕</span>
                            <p className="text-red-400 text-xs">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !text.trim()}
                        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Generating…
                            </>
                        ) : <>✦ Generate</>}
                    </button>
                    {loading && <p className="text-white/25 text-xs">Analyzing, ~5 seconds…</p>}
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                            {result.language && LANG_FLAG[result.language] && (
                                <span className="text-xl shrink-0">{LANG_FLAG[result.language]}</span>
                            )}
                            {result.title && (
                                <h2 className="text-lg font-bold text-white truncate">{result.title}</h2>
                            )}
                        </div>
                        {result._id && (
                            <Link href={`/history/${result._id}`} className="text-xs text-violet-400 hover:text-violet-300 transition-colors shrink-0">
                                View in history →
                            </Link>
                        )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {tabs.map(({ key, label, icon }) => {
                            const locked = isLocked(key); const active = tab === key;
                            return (
                                <button key={key} onClick={() => !locked && setTab(key)} disabled={locked}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                        ${active ? 'bg-violet-600 text-white' : locked ? 'border border-white/6 text-white/20 cursor-not-allowed' : 'border border-white/10 text-white/50 hover:border-white/25 hover:text-white'}`}>
                                    <span>{icon}</span>{label}
                                    {locked && <span className="text-[10px] bg-violet-500/15 border border-violet-500/25 text-violet-400 px-1.5 py-0.5 rounded-md font-bold">PRO</span>}
                                </button>
                            );
                        })}
                    </div>

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