'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

const STEPS = [
    {
        icon: '✦',
        color: 'violet',
        title: 'Generate study material',
        description: 'Paste any text — lecture notes, book chapters, articles — and get a full summary, quiz, flashcards and open questions in under 5 seconds.',
        action: 'Go to Generate',
        href: '/generate',
    },
    {
        icon: '📝',
        color: 'indigo',
        title: 'Test yourself with quizzes',
        description: 'Auto-generated multiple-choice questions with smart distractors. Know what you actually know before the exam.',
        action: 'Try it out',
        href: '/generate',
    },
    {
        icon: '🃏',
        color: 'fuchsia',
        title: 'Study with flashcards',
        description: 'Term and definition pairs ready for review. Flip them, mark what you know, and track your progress over time.',
        action: 'See flashcards',
        href: '/generate',
    },
    {
        icon: '🧠',
        color: 'emerald',
        title: 'Spaced repetition mode',
        description: 'Study mode uses the SM-2 algorithm to show you cards at the right time — so you review less and remember more.',
        action: 'Open Study mode',
        href: '/study',
    },
];

const COLOR: Record<string, string> = {
    violet: 'bg-violet-500/10 border-violet-500/25 text-violet-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
    fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/25 text-fuchsia-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
};

const DOT: Record<string, string> = {
    violet: 'bg-violet-500',
    indigo: 'bg-indigo-500',
    fuchsia: 'bg-fuchsia-500',
    emerald: 'bg-emerald-500',
};

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(0);
    const [closing, setClosing] = useState(false);
    const router = useRouter();

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    const complete = async () => {
        setClosing(true);
        try {
            await api('/auth/complete-onboarding', { method: 'POST' });
        } catch { /* silencioso */ }
        onClose();
    };

    const handleAction = async () => {
        if (isLast) {
            await complete();
            router.push(current.href);
        } else {
            setStep(s => s + 1);
        }
    };

    const handleSkip = async () => {
        await complete();
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">

                {/* Modal */}
                <div className={`relative bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/60 transition-all duration-300 ${closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

                    {/* Skip */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-white/20 hover:text-white/50 transition-colors text-sm"
                    >
                        Skip ✕
                    </button>

                    {/* Dots de progreso */}
                    <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                        {STEPS.map((_, i) => (
                            <div key={i} className={`rounded-full transition-all duration-300 ${i === step
                                    ? `w-6 h-1.5 ${DOT[STEPS[i].color]}`
                                    : i < step
                                        ? `w-1.5 h-1.5 ${DOT[STEPS[i].color]} opacity-60`
                                        : 'w-1.5 h-1.5 bg-white/15'
                                }`} />
                        ))}
                    </div>

                    {/* Contenido */}
                    <div className="p-8 pt-4 space-y-6">

                        {/* Icono */}
                        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl mx-auto ${COLOR[current.color]}`}>
                            {current.icon}
                        </div>

                        {/* Texto */}
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-black tracking-tight text-white">
                                {current.title}
                            </h2>
                            <p className="text-white/45 text-sm leading-relaxed">
                                {current.description}
                            </p>
                        </div>

                        {/* Botones */}
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={handleAction}
                                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLast ? current.action : 'Next →'}
                            </button>

                            {!isLast && (
                                <button
                                    onClick={() => setStep(s => s + 1)}
                                    className="w-full text-white/25 hover:text-white/50 text-sm py-2 transition-colors"
                                >
                                    Skip this step
                                </button>
                            )}
                        </div>

                        {/* Contador */}
                        <p className="text-center text-white/20 text-xs">
                            {step + 1} of {STEPS.length}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}