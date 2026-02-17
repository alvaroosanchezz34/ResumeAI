'use client';

import Link from 'next/link';
import { useState } from 'react';
import { startCheckout } from '../../services/api';

function UpgradeButton({ plan, children }: { plan: 'premium' | 'pro'; children: React.ReactNode }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            await startCheckout(plan);
        } catch (err: any) {
            alert(err.message || 'Could not start checkout. Please try again.');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Redirecting...
                </span>
            ) : children}
        </button>
    );
}

const PLANS = [
    {
        name: 'Free', price: '€0', period: null,
        description: 'Perfect to try it out',
        features: ['5 generations per day', 'Summaries', 'Flashcards', 'History'],
        featured: false, type: 'free' as const
    },
    {
        name: 'Premium', price: '€9.99', period: 'month',
        description: 'For serious students',
        features: ['50 generations per day', 'All 4 content types', 'Quiz mode', 'Unlimited history', 'Priority processing'],
        featured: true, type: 'premium' as const
    },
    {
        name: 'Pro', price: '€19.99', period: 'month',
        description: 'Maximum output',
        features: ['200 generations per day', 'Everything in Premium', 'PDF export', 'Language selection', 'Priority support'],
        featured: false, type: 'pro' as const
    },
];

export default function PricingPage() {
    return (
        <div className="space-y-20 py-8">

            {/* Header */}
            <div className="text-center space-y-4 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/8 text-violet-300 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full">
                    Pricing
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">Simple, honest pricing</h1>
                <p className="text-white/40">Start free, no credit card required. Upgrade when you need more.</p>
            </div>

            {/* Plans */}
            <div className="grid md:grid-cols-3 gap-5 items-center max-w-5xl mx-auto">
                {PLANS.map(({ name, price, period, description, features, featured, type }) => (
                    <div
                        key={name}
                        className={`relative rounded-2xl p-7 flex flex-col gap-6 transition-all duration-300
                            ${featured
                                ? 'bg-violet-600 scale-[1.04] shadow-2xl shadow-violet-500/25'
                                : 'bg-white/[0.03] border border-white/8 hover:border-white/15'}`}
                    >
                        {featured && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0e0e14] text-violet-400 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-violet-500/40">
                                Most popular
                            </div>
                        )}

                        <div>
                            <p className="font-bold text-lg">{name}</p>
                            <p className={`text-xs mt-0.5 ${featured ? 'text-white/60' : 'text-white/30'}`}>{description}</p>
                            <div className="flex items-baseline gap-1 mt-4">
                                <span className="text-4xl font-black">{price}</span>
                                {period && <span className={`text-sm ${featured ? 'text-white/60' : 'text-white/35'}`}>/{period}</span>}
                            </div>
                        </div>

                        <ul className="flex flex-col gap-2.5 flex-1">
                            {features.map((f, i) => (
                                <li key={i} className={`flex items-start gap-2.5 text-sm ${featured ? 'text-white/85' : 'text-white/50'}`}>
                                    <span className={`mt-0.5 text-xs font-bold shrink-0 ${featured ? 'text-white' : 'text-violet-400'}`}>✓</span>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {type === 'free' ? (
                            <Link
                                href="/register"
                                className="block text-center py-3 rounded-xl text-sm font-bold border border-white/12 hover:border-violet-500/40 hover:text-violet-300 transition-all duration-200"
                            >
                                Get started →
                            </Link>
                        ) : (
                            <div className={featured ? '[&>button]:bg-white [&>button]:text-violet-700 [&>button]:hover:bg-white/90' : '[&>button]:border [&>button]:border-white/12 [&>button]:hover:border-violet-500/40 [&>button]:hover:text-violet-300'}>
                                <UpgradeButton plan={type}>
                                    {name === 'Premium' ? 'Upgrade to Premium →' : 'Go Pro →'}
                                </UpgradeButton>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom note */}
            <div className="text-center space-y-2 text-white/25 text-sm pb-8">
                <p>All plans include a 14-day money-back guarantee.</p>
                <p>Cancel anytime from your dashboard — no questions asked.</p>
            </div>
        </div>
    );
}