'use client';

import Link from 'next/link';
import { useState } from 'react';
import { startCheckout } from '../../services/api';

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/8 text-violet-300 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full">
            {children}
        </span>
    );
}

function PriceCard({
    name, price, period, features, cta, featured = false, onClick, loading = false
}: {
    name: string; price: string; period?: string;
    features: string[]; cta: string; featured?: boolean;
    onClick?: () => void; loading?: boolean;
}) {
    return (
        <div className={`relative rounded-2xl p-7 flex flex-col gap-6 transition-all duration-300
            ${featured
                ? 'bg-violet-600 text-white scale-[1.04] shadow-2xl shadow-violet-500/25'
                : 'bg-white/[0.03] border border-white/8 hover:border-white/18 text-white'}`}>
            {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0e0e14] text-violet-400 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-violet-500/40">
                    Most Popular
                </div>
            )}
            <div>
                <p className="font-bold text-lg">{name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-black">{price}</span>
                    {period && <span className={`text-sm ${featured ? 'text-white/60' : 'text-white/35'}`}>/{period}</span>}
                </div>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1">
                {features.map((f, i) => (
                    <li key={i} className={`flex items-center gap-2.5 text-sm ${featured ? 'text-white/85' : 'text-white/50'}`}>
                        <span className={`text-xs font-bold ${featured ? 'text-white' : 'text-violet-400'}`}>✓</span>
                        {f}
                    </li>
                ))}
            </ul>
            {onClick ? (
                <button
                    onClick={onClick}
                    disabled={loading}
                    className={`block text-center py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50
                        ${featured
                            ? 'bg-white text-violet-700 hover:bg-white/90'
                            : 'border border-white/12 hover:border-white/25 hover:bg-white/4'}`}
                >
                    {loading ? 'Redirecting…' : cta}
                </button>
            ) : (
                <Link href="/register"
                    className={`block text-center py-3 rounded-xl text-sm font-bold transition-all duration-200
                        ${featured
                            ? 'bg-white text-violet-700 hover:bg-white/90'
                            : 'border border-white/12 hover:border-white/25 hover:bg-white/4'}`}>
                    {cta}
                </Link>
            )}
        </div>
    );
}

export default function PricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [navSolid, setNavSolid] = useState(false);

    const handleUpgrade = async (plan: 'premium' | 'pro') => {
        setLoadingPlan(plan);
        try {
            await startCheckout(plan);
        } catch (err: any) {
            alert(err.message || 'Could not start checkout');
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0e0e14] text-white">

            {/* Nav */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
                ${navSolid ? 'bg-[#0e0e14]/90 backdrop-blur-2xl border-b border-white/6' : 'border-b border-white/6 bg-[#0e0e14]'}`}>
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link href="/" className="font-black text-lg tracking-tight">
                        Resume<span className="text-violet-400">AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
                        <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/#how-it-works" className="hover:text-white transition-colors">How it works</Link>
                        <Link href="/pricing" className="text-white font-medium">Pricing</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">Log in</Link>
                        <Link href="/register" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                            Get started →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Contenido */}
            <div className="pt-14">
                <div className="max-w-4xl mx-auto px-6 py-24">
                    <div className="text-center mb-14">
                        <Pill>Pricing</Pill>
                        <h1 className="mt-5 text-5xl md:text-6xl font-black tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                            Start free, grow when ready
                        </h1>
                        <p className="text-white/35 mt-3 text-sm">No hidden fees. Cancel anytime.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 items-center">
                        <PriceCard
                            name="Free" price="€0"
                            features={['5 generations / day', 'Summaries', 'Flashcards', 'History']}
                            cta="Get started →"
                        />
                        <PriceCard
                            name="Premium" price="€9.99" period="mo"
                            features={['50 generations / day', 'All 4 output types', 'Quiz mode', 'Priority speed', 'Unlimited history']}
                            cta="Upgrade →"
                            featured
                            onClick={() => handleUpgrade('premium')}
                            loading={loadingPlan === 'premium'}
                        />
                        <PriceCard
                            name="Pro" price="€19.99" period="mo"
                            features={['200 generations / day', 'Everything in Premium', 'PDF export', 'Language selection', 'Priority support']}
                            cta="Go Pro →"
                            onClick={() => handleUpgrade('pro')}
                            loading={loadingPlan === 'pro'}
                        />
                    </div>

                    {/* FAQ mínimo */}
                    <div className="mt-20 grid md:grid-cols-2 gap-6 text-sm">
                        {[
                            { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your dashboard at any time, no questions asked. You keep access until the end of the billing period.' },
                            { q: 'What counts as a generation?', a: 'Each time you submit text and get study material back counts as one generation, regardless of how many output types you select.' },
                            { q: 'Do unused generations roll over?', a: 'No — the daily limit resets at midnight UTC every day.' },
                            { q: 'Can I upgrade or downgrade?', a: 'Yes, you can switch plans at any time from your billing portal.' },
                        ].map(({ q, a }) => (
                            <div key={q} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                                <p className="text-white font-semibold mb-2">{q}</p>
                                <p className="text-white/40 leading-relaxed">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}