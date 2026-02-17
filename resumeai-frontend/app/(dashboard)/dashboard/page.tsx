'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../services/api';
import { openBillingPortal } from '../../../services/api';
import Link from 'next/link';

type Stats = {
    plan: string;
    totalGenerations: number;
    usedToday: number;
    limit: number;
    remaining: number;
    lastGeneration: string | null;
};

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
            <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-3">{label}</p>
            <div className="text-2xl font-black text-white">{value}</div>
            {sub && <p className="text-white/25 text-xs mt-1">{sub}</p>}
        </div>
    );
}

function Skeleton() {
    return (
        <div className="p-8 space-y-8">
            <div className="h-8 w-36 bg-white/5 rounded-xl animate-pulse" />
            <div className="grid md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
                ))}
            </div>
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
        </div>
    );
}

const PLAN_BADGE: Record<string, string> = {
    free:    'text-white/50 bg-white/6 border-white/10',
    premium: 'text-violet-300 bg-violet-500/12 border-violet-500/25',
    pro:     'text-indigo-300 bg-indigo-500/12 border-indigo-500/25',
    admin:   'text-amber-300 bg-amber-500/12 border-amber-500/25',
};

export default function DashboardPage() {
    const [stats, setStats]       = useState<Stats | null>(null);
    const [error, setError]       = useState('');
    const [portalLoading, setPortalLoading] = useState(false);
    const searchParams = useSearchParams();
    const upgraded = searchParams.get('upgrade') === 'success';

    useEffect(() => {
        api('/generation/stats')
            .then(res => setStats(res.data))
            .catch(() => setError('Could not load stats.'));
    }, []);

    const handlePortal = async () => {
        setPortalLoading(true);
        try {
            await openBillingPortal();
        } catch (err: any) {
            alert(err.message || 'Could not open billing portal.');
            setPortalLoading(false);
        }
    };

    if (error) return <div className="p-8 text-white/40 text-sm">{error}</div>;
    if (!stats) return <Skeleton />;

    const pct = stats.limit > 0 ? Math.min((stats.usedToday / stats.limit) * 100, 100) : 0;
    const barColor = pct >= 90 ? 'bg-red-500' : pct >= 65 ? 'bg-amber-500' : 'bg-violet-500';
    const isPaid = stats.plan !== 'free';

    return (
        <div className="p-8 space-y-8 max-w-5xl">

            {/* Upgrade success banner */}
            {upgraded && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-5 py-4">
                    <span className="text-emerald-400 text-xl">✓</span>
                    <div>
                        <p className="text-emerald-300 font-semibold text-sm">Plan upgraded successfully!</p>
                        <p className="text-emerald-400/60 text-xs mt-0.5">Your new limits are active right now.</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
                <Link
                    href="/generate"
                    className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-200"
                >
                    ✦ New generation
                </Link>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <StatCard
                    label="Plan"
                    value={
                        <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize border ${PLAN_BADGE[stats.plan] ?? PLAN_BADGE.free}`}>
                            {stats.plan}
                        </span>
                    }
                />
                <StatCard label="Total generations" value={stats.totalGenerations} sub="all time" />
                <StatCard label="Used today" value={`${stats.usedToday} / ${stats.limit}`} sub={`${stats.remaining} remaining`} />
                <StatCard
                    label="Last generation"
                    value={stats.lastGeneration
                        ? new Date(stats.lastGeneration).toLocaleDateString('en', { day: 'numeric', month: 'short' })
                        : '—'}
                    sub={stats.lastGeneration
                        ? new Date(stats.lastGeneration).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
                        : undefined}
                />
            </div>

            {/* Usage bar */}
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
                        <Link href="/pricing" className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
                            Upgrade →
                        </Link>
                    </div>
                ) : stats.remaining <= 2 ? (
                    <p className="text-amber-400 text-sm">Only {stats.remaining} generation{stats.remaining === 1 ? '' : 's'} left today.</p>
                ) : null}
            </div>

            {/* Quick actions */}
            <div>
                <p className="text-white/25 text-xs uppercase tracking-wider mb-4">Quick actions</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <Link href="/generate" className="group bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
                        <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 text-lg group-hover:bg-violet-500/20 transition-colors">✦</div>
                        <div>
                            <p className="font-semibold text-sm">Generate content</p>
                            <p className="text-white/35 text-xs mt-0.5">Paste any text and get study material</p>
                        </div>
                        <span className="ml-auto text-white/20 group-hover:text-white/50 transition-colors text-sm">→</span>
                    </Link>

                    <Link href="/history" className="group bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
                        <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 text-lg group-hover:bg-violet-500/20 transition-colors">◷</div>
                        <div>
                            <p className="font-semibold text-sm">View history</p>
                            <p className="text-white/35 text-xs mt-0.5">{stats.totalGenerations} past generation{stats.totalGenerations !== 1 ? 's' : ''}</p>
                        </div>
                        <span className="ml-auto text-white/20 group-hover:text-white/50 transition-colors text-sm">→</span>
                    </Link>
                </div>
            </div>

            {/* Subscription management */}
            {isPaid && (
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-white font-semibold text-sm">Subscription</p>
                        <p className="text-white/35 text-xs mt-0.5">Manage, change or cancel your plan</p>
                    </div>
                    <button
                        onClick={handlePortal}
                        disabled={portalLoading}
                        className="text-sm border border-white/12 hover:border-white/25 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-40"
                    >
                        {portalLoading ? 'Opening...' : 'Manage billing →'}
                    </button>
                </div>
            )}

            {/* Upsell para free */}
            {!isPaid && (
                <div className="bg-violet-600/8 border border-violet-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-violet-300 font-semibold text-sm">You're on the Free plan</p>
                        <p className="text-white/35 text-xs mt-0.5">Upgrade to unlock all content types and 50 generations/day</p>
                    </div>
                    <Link
                        href="/pricing"
                        className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-200 shrink-0"
                    >
                        Upgrade →
                    </Link>
                </div>
            )}
        </div>
    );
}