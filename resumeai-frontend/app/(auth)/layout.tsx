import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0e0e14] text-white flex flex-col">

            {/* Nav */}
            <nav className="border-b border-white/6 px-6 h-14 flex items-center justify-between shrink-0">
                <Link href="/" className="font-black text-lg tracking-tight">
                    Resume<span className="text-violet-400">AI</span>
                </Link>
                <div className="flex items-center gap-6 text-sm text-white/40">
                    <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/login"   className="hover:text-white transition-colors">Log in</Link>
                </div>
            </nav>

            {/* Contenido centrado */}
            <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
                {/* Orb */}
                <div className="absolute w-[500px] h-[500px] rounded-full bg-violet-700 blur-[120px] opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                {/* Grid */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
                    backgroundSize: '44px 44px',
                }} />
                <div className="relative z-10 w-full max-w-sm py-12">
                    {children}
                </div>
            </div>
        </div>
    );
}