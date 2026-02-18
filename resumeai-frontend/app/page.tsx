// app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ── Animated counter on scroll ──────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    const el = useRef<HTMLSpanElement>(null);
    const ran = useRef(false);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting || ran.current) return;
            ran.current = true;
            const steps = 55;
            let i = 0;
            const tick = setInterval(() => {
                i++;
                setVal(Math.round((to / steps) * i));
                if (i >= steps) { setVal(to); clearInterval(tick); }
            }, 1600 / steps);
        }, { threshold: 0.5 });
        if (el.current) obs.observe(el.current);
        return () => obs.disconnect();
    }, [to]);

    return <span ref={el}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Soft glow orb ───────────────────────────────────────── */
function Orb({ cls }: { cls: string }) {
    return <div className={`absolute rounded-full pointer-events-none blur-[100px] opacity-[0.12] ${cls}`} />;
}

/* ── Tiny reusable pill ──────────────────────────────────── */
function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/8 text-violet-300 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full">
            {children}
        </span>
    );
}

/* ── Feature card ────────────────────────────────────────── */
function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
    return (
        <div className="group relative bg-white/[0.03] border border-white/8 rounded-2xl p-7 overflow-hidden hover:border-violet-500/30 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-4 mb-2 font-semibold text-white text-[15px] tracking-tight">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{body}</p>
            </div>
        </div>
    );
}

/* ── Testimonial ─────────────────────────────────────────── */
function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors duration-300">
            <p className="text-violet-400 text-sm mb-3 tracking-wide">★★★★★</p>
            <p className="text-white/60 text-sm leading-relaxed mb-5">"{quote}"</p>
            <div>
                <p className="text-white text-sm font-semibold">{name}</p>
                <p className="text-white/30 text-xs mt-0.5">{role}</p>
            </div>
        </div>
    );
}

/* ── How it works step ───────────────────────────────────── */
function Step({ n, title, body }: { n: string; title: string; body: string }) {
    return (
        <div className="flex gap-5">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold text-sm">
                {n}
            </div>
            <div className="pt-0.5">
                <p className="font-semibold text-white mb-1">{title}</p>
                <p className="text-white/45 text-sm leading-relaxed">{body}</p>
            </div>
        </div>
    );
}

/* ── Pricing card ────────────────────────────────────────── */
function PriceCard({
    name, price, period, features, cta, featured = false
}: {
    name: string; price: string; period?: string;
    features: string[]; cta: string; featured?: boolean;
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
                <p className={`font-bold text-lg ${featured ? 'text-white' : 'text-white'}`}>{name}</p>
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
            <Link
                href="/register"
                className={`block text-center py-3 rounded-xl text-sm font-bold transition-all duration-200
                    ${featured
                        ? 'bg-white text-violet-700 hover:bg-white/90'
                        : 'border border-white/12 hover:border-white/25 hover:bg-white/4'}`}
            >
                {cta}
            </Link>
        </div>
    );
}

/* ── Main page ───────────────────────────────────────────── */
export default function HomePage() {
    const [navSolid, setNavSolid] = useState(false);

    useEffect(() => {
        const fn = () => setNavSolid(window.scrollY > 30);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <div className="bg-[#0e0e14] text-white min-h-screen overflow-x-hidden">

            {/* ─── Global styles ─── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
                @keyframes floatY {
                    0%,100% { transform: translateY(0);    }
                    50%     { transform: translateY(-10px); }
                }
                @keyframes gradShift {
                    0%,100% { background-position: 0% 50%;   }
                    50%     { background-position: 100% 50%; }
                }
                @keyframes blink {
                    0%,100% { opacity: 1; }
                    50%     { opacity: 0.3; }
                }

                .anim-1 { animation: fadeUp .65s ease both; }
                .anim-2 { animation: fadeUp .65s .12s ease both; }
                .anim-3 { animation: fadeUp .65s .24s ease both; }
                .anim-4 { animation: fadeUp .65s .36s ease both; }

                .float { animation: floatY 5s ease-in-out infinite; }

                .grad-text {
                    background: linear-gradient(135deg, #a78bfa, #818cf8, #c4b5fd, #7c3aed);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradShift 5s ease infinite;
                }

                .dot-blink { animation: blink 2s ease-in-out infinite; }

                .grid-lines {
                    background-image:
                        linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
                    background-size: 44px 44px;
                }

                .noise::after {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
                    opacity: .028;
                    pointer-events: none;
                    z-index: 9999;
                }
            `}</style>

            <div className="noise" />

            {/* ─── Navbar ─── */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
                ${navSolid ? 'bg-[#0e0e14]/90 backdrop-blur-2xl border-b border-white/6' : ''}`}>
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="font-black text-xl tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                        Resume<span className="text-violet-400">AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
                        <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            Get started →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 grid-lines">
                <Orb cls="w-[700px] h-[700px] bg-violet-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <Orb cls="w-[250px] h-[250px] bg-indigo-500 top-16 right-12" />
                <Orb cls="w-[180px] h-[180px] bg-fuchsia-600 bottom-32 left-8" />

                <div className="relative z-10 max-w-4xl">
                    <div className="anim-1 mb-8">
                        <Pill>
                            <span className="dot-blink w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                            AI study tool · now in beta
                        </Pill>
                    </div>

                    <h1 className="anim-2 text-[clamp(52px,9vw,96px)] font-black leading-[0.88] tracking-[-0.03em] mb-6"
                        style={{ fontFamily: 'Syne, sans-serif' }}>
                        Turn any text into<br />
                        <span className="grad-text">study material</span>
                    </h1>

                    <p className="anim-3 text-white/45 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10">
                        Paste lecture notes, chapters or articles and get summaries,
                        flashcards, quizzes and open questions — in under 5 seconds.
                    </p>

                    <div className="anim-4 flex flex-wrap items-center justify-center gap-3 mb-8">
                        <Link
                            href="/register"
                            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20"
                        >
                            Start for free
                        </Link>
                        <a href="#how-it-works"
                            className="text-white/40 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
                            See how it works <span>↓</span>
                        </a>
                    </div>

                    <div className="anim-4 flex flex-wrap justify-center gap-6 text-white/25 text-xs">
                        <span>✓ No credit card</span>
                        <span>✓ 5 free generations per day</span>
                        <span>✓ Cancel anytime</span>
                    </div>
                </div>

                {/* App mockup */}
                <div className="relative z-10 float mt-20 w-full max-w-2xl mx-auto px-6">
                    <div className="bg-[#13131f] border border-white/8 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
                        {/* Browser bar */}
                        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6">
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            <span className="ml-3 text-white/20 text-[11px] font-mono">app / generate</span>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="bg-[#0e0e14] rounded-xl p-4 border border-white/5">
                                <p className="text-[10px] text-white/20 font-mono mb-2">INPUT</p>
                                <p className="text-white/50 text-sm leading-relaxed">The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration, converting glucose and oxygen into usable energy...</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {['Summary', 'Test', 'Flashcards', 'Development'].map((t, i) => (
                                    <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${i === 0 ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/35'}`}>{t}</span>
                                ))}
                            </div>
                            <div className="bg-[#0e0e14] rounded-xl p-4 border border-white/5">
                                <p className="text-[10px] text-white/20 font-mono mb-2">OUTPUT · SUMMARY</p>
                                <p className="text-white/60 text-sm leading-relaxed">Mitochondria generate cellular energy (ATP) via respiration, processing glucose and oxygen. Essential for metabolism and all cell activity.</p>
                                <div className="flex gap-2 mt-3">
                                    <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-1 rounded-md">1.3s</span>
                                    <span className="text-[10px] bg-white/5 text-white/25 px-2 py-1 rounded-md">gpt-4o-mini</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/15 text-xs text-center space-y-1 animate-bounce">
                    <p>scroll</p><p>↓</p>
                </div>
            </section>

            {/* ─── Stats ─── */}
            <section className="border-y border-white/6 py-16">
                <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { to: 8500,  suffix: '+', label: 'Texts processed' },
                        { to: 97,    suffix: '%', label: 'Satisfaction rate' },
                        { to: 4,     suffix: '',  label: 'Output formats' },
                        { to: 3,     suffix: 's', label: 'Avg generation time' },
                    ].map(({ to, suffix, label }) => (
                        <div key={label}>
                            <p className="text-4xl font-black text-white">
                                <Counter to={to} suffix={suffix} />
                            </p>
                            <p className="text-white/35 text-xs mt-1.5">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Features ─── */}
            <section id="features" className="py-28 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <Pill>Features</Pill>
                        <h2 className="mt-5 text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                            Four tools, one paste
                        </h2>
                        <p className="text-white/40 mt-4 max-w-md mx-auto text-sm leading-relaxed">
                            Everything you need to go from raw material to exam-ready, in one place.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard icon="📄" title="Smart Summaries" body="Dense chapters become clear, structured summaries that keep every key idea without the noise." />
                        <FeatureCard icon="📝" title="Quiz Questions" body="Auto-generated multiple-choice with distractors. Know what you actually know before the exam." />
                        <FeatureCard icon="🃏" title="Flashcards" body="Term/definition pairs ready for spaced repetition. Study them here or export to Anki." />
                        <FeatureCard icon="💬" title="Open Questions" body="Deeper, essay-style prompts that force you to explain — not just recognize — the material." />
                    </div>
                </div>
            </section>

            {/* ─── How it works ─── */}
            <section id="how-it-works" className="py-28 px-6 bg-white/[0.02] border-y border-white/6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                    <div>
                        <Pill>How it works</Pill>
                        <h2 className="mt-5 text-4xl md:text-5xl font-black tracking-tight leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                            Three steps.<br />That's really it.
                        </h2>
                        <p className="text-white/40 mt-4 text-sm leading-relaxed max-w-sm">
                            No configuration, no learning curve. Open the app, paste your text, and you're done.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <Step n="1" title="Paste your text" body="Lecture notes, PDF chapters, articles — anything written. Up to 8,000 characters per generation." />
                        <div className="w-px h-5 bg-white/8 ml-[18px]" />
                        <Step n="2" title="Pick your format" body="Summary, quiz, flashcards, open questions — or generate all four at once." />
                        <div className="w-px h-5 bg-white/8 ml-[18px]" />
                        <Step n="3" title="Study and retain" body="Review the output, take the quiz interactively, and save everything to your history." />
                    </div>
                </div>
            </section>

            {/* ─── Testimonials ─── */}
            <section className="py-28 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <Pill>Testimonials</Pill>
                        <h2 className="mt-5 text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                            What students say
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5">
                        <Testimonial quote="Pasted my whole biology chapter and had flashcards ready in seconds. Passed with an 8.5. I genuinely didn't expect it to be this good." name="Marta G." role="University · Biology" />
                        <Testimonial quote="The quiz questions match exactly what my professor tests. I use it the night before every exam now. Hasn't let me down once." name="Carlos R." role="High school · Chemistry & Physics" />
                        <Testimonial quote="I'm prepping for public service exams. The summaries cut my reading time in half, and the open questions are harder than the real test." name="Elena M." role="Civil service candidate" />
                        <Testimonial quote="Finally something built for how I actually study. Paste, get cards, quiz myself. No friction at all." name="Tomás F." role="Engineering student" />
                        <Testimonial quote="The summaries are legitimately good — it pulls the key ideas, not just random sentences. Huge difference from other tools I've tried." name="Ana L." role="Law student" />
                        <Testimonial quote="Was skeptical. Now I can't study without it. The open questions push me harder than my actual exam did." name="Javier P." role="Medicine student" />
                    </div>
                </div>
            </section>

            {/* ─── Pricing ─── */}
            <section id="pricing" className="py-28 px-6 bg-white/[0.02] border-y border-white/6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <Pill>Pricing</Pill>
                        <h2 className="mt-5 text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                            Start free, grow when ready
                        </h2>
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
                        />
                        <PriceCard
                            name="Pro" price="€19.99" period="mo"
                            features={['200 generations / day', 'Everything in Premium', 'PDF export', 'Language selection', 'Priority support']}
                            cta="Go Pro →"
                        />
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ─── */}
            <section className="relative py-36 px-6 text-center overflow-hidden">
                <Orb cls="w-[600px] h-[600px] bg-violet-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 max-w-2xl mx-auto space-y-7">
                    <h2 className="text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9]" style={{ fontFamily: 'Syne, sans-serif' }}>
                        Ready to actually<br />
                        <span className="grad-text">remember this?</span>
                    </h2>
                    <p className="text-white/40 text-lg leading-relaxed">
                        Join students who spend less time re-reading and more time actually learning.
                    </p>
                    <Link
                        href="/register"
                        className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg px-10 py-5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl shadow-violet-500/25"
                    >
                        Start for free today →
                    </Link>
                    <p className="text-white/20 text-xs">No card required · 5 free generations per day · Cancel anytime</p>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="border-t border-white/6 py-10 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
                    <span className="font-black text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                        Resume<span className="text-violet-400">AI</span>
                    </span>
                    <div className="flex gap-7 text-sm text-white/25">
                        <a href="#pricing" className="hover:text-white/60 transition-colors">Pricing</a>
                        <Link href="/login" className="hover:text-white/60 transition-colors">Login</Link>
                        <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
                    </div>
                    <p className="text-white/15 text-sm">© 2026 ResumeAI</p>
                </div>
            </footer>
        </div>
    );
}