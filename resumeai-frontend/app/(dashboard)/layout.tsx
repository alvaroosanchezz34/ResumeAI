'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout, getToken, refreshTokenIfNeeded } from '@/utils/auth';
import { api } from '@/services/api';

const NAV = [
    { href: '/dashboard', label: 'Dashboard', icon: '▦' },
    { href: '/generate', label: 'Generate', icon: '✦' },
    { href: '/history', label: 'History', icon: '◷' },
    { href: '/study', label: 'Study', icon: '🧠' },
    { href: '/profile', label: 'Profile', icon: '👤' },
];

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/generate': 'Generate',
    '/history': 'History',
    '/study': 'Study mode',
    '/admin': 'Admin Panel',
    '/profile': 'Profile',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.replace('/login');
            return;
        }
        refreshTokenIfNeeded();
        api('/auth/me')
            .then(res => {
                if (res.user?.role === 'admin') setIsAdmin(true);
                if (res.user?.email) setEmail(res.user.email);
            })
            .catch(() => { })
            .finally(() => setReady(true));
    }, [router]);

    // Cerrar menu mobile al cambiar de página
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    if (!ready) {
        return (
            <div className="min-h-screen bg-[#0e0e14] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const pageTitle = PAGE_TITLES[pathname] ?? (pathname.startsWith('/history/') ? 'Session detail' : '');

    const SidebarContent = () => (
        <>
            <Link href="/" className="px-2 mb-8 font-black text-lg tracking-tight block">
                Resume<span className="text-violet-400">AI</span>
            </Link>

            <nav className="flex flex-col gap-1 flex-1">
                {NAV.map(({ href, label, icon }) => {
                    const active = pathname === href;
                    return (
                        <Link key={href} href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                ${active
                                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                                    : 'text-white/40 hover:text-white hover:bg-white/4'}`}>
                            <span className="text-base w-4 text-center">{icon}</span>
                            {label}
                        </Link>
                    );
                })}

                {isAdmin && (
                    <Link href="/admin"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-2 border
                            ${pathname === '/admin'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                : 'text-amber-400/50 hover:text-amber-300 hover:bg-amber-500/6 border-transparent'}`}>
                        <span className="text-base w-4 text-center">⚙</span>
                        Admin
                    </Link>
                )}
            </nav>

            <div className="border-t border-white/6 pt-4 mt-2 space-y-1">
                {email && (
                    <p className="px-3 text-[11px] text-white/20 truncate">{email}</p>
                )}
                <button onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/25 hover:text-red-400 hover:bg-red-500/6 transition-all duration-200">
                    <span className="text-base w-4 text-center">→</span>
                    Log out
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-[#0e0e14] text-white">

            {/* ── Sidebar desktop (oculto en mobile) ── */}
            <aside className="hidden md:flex w-56 shrink-0 border-r border-white/6 flex-col py-6 px-4 sticky top-0 h-screen">
                <SidebarContent />
            </aside>

            {/* ── Overlay mobile ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Drawer mobile ── */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0e0e14] border-r border-white/6 flex flex-col py-6 px-4 z-50 transition-transform duration-300 md:hidden
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Botón cerrar */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-xl"
                >
                    ✕
                </button>
                <SidebarContent />
            </aside>

            {/* ── Área principal ── */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

                {/* Topbar */}
                <header className="h-14 border-b border-white/6 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 bg-[#0e0e14] z-10">
                    <div className="flex items-center gap-3">
                        {/* Botón hamburguesa — solo mobile */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <span className="w-5 h-0.5 bg-white/50 rounded-full" />
                            <span className="w-5 h-0.5 bg-white/50 rounded-full" />
                            <span className="w-5 h-0.5 bg-white/50 rounded-full" />
                        </button>
                        <p className="text-sm font-semibold text-white/60">{pageTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <Link href="/pricing"
                            className="hidden sm:block text-xs text-white/25 hover:text-white/60 transition-colors">
                            Pricing
                        </Link>
                        <Link href="/generate"
                            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                            ✦ New
                        </Link>
                    </div>
                </header>

                {/* Contenido */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}