export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0e0e14] text-white flex items-center justify-center px-6 relative overflow-hidden">
            {/* Orb de fondo */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-violet-700 blur-[120px] opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Grid sutil */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
                    backgroundSize: '44px 44px',
                }}
            />

            <div className="relative z-10 w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <a href="/" className="inline-block font-black text-2xl tracking-tight">
                        Resume<span className="text-violet-400">AI</span>
                    </a>
                </div>
                {children}
            </div>
        </div>
    );
}