'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, openBillingPortal } from '../../../services/api';
import Link from 'next/link';
import OnboardingModal from '../../components/OnboardingModal';

type Stats = {
    plan: string;
    totalGenerations: number;
    usedToday: number;
    limit: number;
    remaining: number;
    lastGeneration: string | null;
    totalFlashcards: number;
    totalQuestions: number;
    dailyActivity: Record<string, number>;
    topLanguages: Record<string, number>;
};

const LANG_NAMES: Record<string, string> = {
    es: '🇪🇸 Spanish', en: '🇺🇸 English', fr: '🇫🇷 French',
    de: '🇩🇪 German', it: '🇮🇹 Italian', pt: '🇵🇹 Portuguese',
    ca: '🏴 Catalan', nl: '🇳🇱 Dutch', ru: '🇷🇺 Russian',
};

const PLAN_BADGE: Record<string, string> = {
    free: 'text-white/50 bg-white/6 border-white/10',
    premium: 'text-violet-300 bg-violet-500/12 border-violet-500/25',
    pro: 'text-indigo-300 bg-indigo-500/12 border-indigo-500/25',
    admin: 'text-amber-300 bg-amber-500/12 border-amber-500/25',
};

function StatCard({ label, value, sub, accent = false }: {
    label: string; value: React.ReactNode; sub?: string; accent?: boolean
}) {
    return (
        <div className={`rounded-2xl p-5 border ${accent ? 'bg-violet-600/10 border-violet-500/20' : 'bg-white/[0.03] border-white/8'}`}>
            <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-3">{label}</p>
            <div className="text-2xl font-black text-white">{value}</div>
            {sub && <p className="text-white/25 text-xs mt-1">{sub}</p>}
        </div>
    );
}

function ActivityChart({ data }: { data: Record<string, number> }) {
    const entries = Object.entries(data);
    const max = Math.max(...entries.map(([, v]) => v), 1);
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-white/35 text-xs font-medium uppercase tracking-wider">Activity — last 7 days</p>
                <p className="text-white/20 text-xs">{entries.reduce((acc, [, v]) => acc + v, 0)} generations</p>
            </div>
            <div className="flex items-end gap-2 h-20">
                {entries.map(([date, count]) => {
                    const pct = (count / max) * 100;
                    const dayLabel = DAY_LABELS[new Date(date + 'T12:00:00').getDay()];
                    const isToday = date === new Date().toISOString().split('T')[0];
                    return (
                        <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
                                <div
                                    className={`w-full rounded-t-md transition-all duration-500 ${isToday ? 'bg-violet-500' : 'bg-white/12'}`}
                                    style={{ height: `${Math.max(pct, count > 0 ? 8 : 2)}%` }}
                                    title={`${count} generation${count !== 1 ? 's' : ''}`}
                                />
                            </div>
                            <span className={`text-[10px] ${isToday ? 'text-violet-400 font-bold' : 'text-white/20'}`}>
                                {dayLabel}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="page-container space-y-8">
            <div className="h-8 w-36 bg-white/5 rounded-xl animate-pulse" />
            <div className="grid md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
                ))}
            </div>
            <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
        </div>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState('');
    const [portalLoading, setPortalLoading] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const searchParams = useSearchParams();
    const upgraded = searchParams.get('upgrade') === 'success';

    useEffect(() => {
        // Cargar stats
        api('/generation/stats')
            .then(res => setStats(res.data))
            .catch(() => setError('Could not load stats.'));

        // Comprobar si hay que mostrar el onboarding
        api('/auth/me')
            .then(res => {
                if (!res.user?.onboardingCompleted) {
                    setShowOnboarding(true);
                }
            })
            .catch(() => { });
    }, []);

    const handlePortal = async () => {
        setPortalLoading(true);
        try { await openBillingPortal(); }
        catch (err: any) { alert(err.message || 'Could not open billing portal.'); setPortalLoading(false); }
    };

    if (error) return <div className="page-container text-white/40 text-sm">{error}</div>;
    if (!stats) return <Skeleton />;

    const pct = stats.limit > 0 ? Math.min((stats.usedToday / stats.limit) * 100, 100) : 0;
    const barColor = pct >= 90 ? 'bg-red-500' : pct >= 65 ? 'bg-amber-500' : 'bg-violet-500';
    const isPaid = stats.plan !== 'free';
    const topLang = Object.entries(stats.topLanguages || {}).sort((a, b) => b[1] - a[1])[0];

    return (
        <>
            {/* Modal de onboarding — solo primera vez */}
            {showOnboarding && (
                <OnboardingModal onClose={() => setShowOnboarding(false)} />
            )}

            <div className="page-container space-y-8 max-w-5xl">

                {/* Banner upgrade exitoso */}
                {upgraded && (
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-5 py-4">
                        <span className="text-emerald-400 text-xl">✓</span>
                        <div>
                            <p className="text-emerald-300 font-semibold text-sm">Plan upgraded successfully!</p>
                            <p className="text-emerald-400/60 text-xs mt-0.5">Your new limits are active right now.</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
                    <Link href="/generate" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                        ✦ New generation
                    </Link>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Plan"
                        value={
                            <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize border ${PLAN_BADGE[stats.plan] ?? PLAN_BADGE.free}`}>
                                {stats.plan}
                            </span>
                        }
                    />
                    <StatCard label="Total sessions" value={stats.totalGenerations} sub="all time" />
                    <StatCard label="Flashcards made" value={stats.totalFlashcards} sub="all time" accent />
                    <StatCard label="Quiz questions" value={stats.totalQuestions} sub="all time" />
                </div>

                {/* Activity chart */}
                {stats.dailyActivity && <ActivityChart data={stats.dailyActivity} />}

                {/* Daily usage */}
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-white/35 text-xs font-medium uppercase tracking-wider">Daily usage</p>
                        <span className="text-white/35 text-xs">{stats.usedToday} of {stats.limit} used</span>
                    </div>
                    <div className="w-full bg-white/6 h-2 rounded-full overflow-hidden">
                        <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    {stats.remaining === 0 ? (
                        <div className="flex items-center justify-between">
                            <p className="text-red-400 text-sm">Daily limit reached. Resets at midnight.</p>
                            <Link href="/pricing" className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">Upgrade →</Link>
                        </div>
                    ) : stats.remaining <= 2 ? (
                        <p className="text-amber-400 text-sm">Only {stats.remaining} generation{stats.remaining === 1 ? '' : 's'} left today.</p>
                    ) : null}
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/generate" className="group bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
                        <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 text-lg group-hover:bg-violet-500/20 transition-colors">✦</div>
                        <div>
                            <p className="font-semibold text-sm">Generate</p>
                            <p className="text-white/35 text-xs mt-0.5">Paste text or upload PDF</p>
                        </div>
                        <span className="ml-auto text-white/20 group-hover:text-white/50 text-sm">→</span>
                    </Link>

                    <Link href="/history" className="group bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
                        <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 text-lg group-hover:bg-violet-500/20 transition-colors">◷</div>
                        <div>
                            <p className="font-semibold text-sm">History</p>
                            <p className="text-white/35 text-xs mt-0.5">{stats.totalGenerations} session{stats.totalGenerations !== 1 ? 's' : ''}</p>
                        </div>
                        <span className="ml-auto text-white/20 group-hover:text-white/50 text-sm">→</span>
                    </Link>

                    <Link href="/study" className="group bg-white/[0.03] border border-white/8 hover:border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
                        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-lg group-hover:bg-emerald-500/20 transition-colors">🧠</div>
                        <div>
                            <p className="font-semibold text-sm">Study mode</p>
                            <p className="text-white/35 text-xs mt-0.5">Spaced repetition</p>
                        </div>
                        <span className="ml-auto text-white/20 group-hover:text-white/50 text-sm">→</span>
                    </Link>
                </div>

                {/* Top language + subscription */}
                <div className="grid md:grid-cols-2 gap-4">
                    {topLang && (
                        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                            <p className="text-white/35 text-xs uppercase tracking-wider mb-3">Most studied language</p>
                            <p className="text-xl font-bold text-white">{LANG_NAMES[topLang[0]] || topLang[0]}</p>
                            <p className="text-white/30 text-xs mt-1">{topLang[1]} session{topLang[1] !== 1 ? 's' : ''} this week</p>
                        </div>
                    )}

                    {isPaid ? (
                        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex items-center justify-between">
                            <div>
                                <p className="text-white font-semibold text-sm">Subscription</p>
                                <p className="text-white/35 text-xs mt-0.5">Manage or cancel your plan</p>
                            </div>
                            <button onClick={handlePortal} disabled={portalLoading}
                                className="text-sm border border-white/12 hover:border-white/25 px-4 py-2 rounded-xl transition-all disabled:opacity-40">
                                {portalLoading ? 'Opening…' : 'Manage →'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-violet-600/8 border border-violet-500/20 rounded-2xl p-5 flex items-center justify-between">
                            <div>
                                <p className="text-violet-300 font-semibold text-sm">You're on the Free plan</p>
                                <p className="text-white/35 text-xs mt-0.5">Unlock all features with Premium</p>
                            </div>
                            <Link href="/pricing" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0">
                                Upgrade →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}