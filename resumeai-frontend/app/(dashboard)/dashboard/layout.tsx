'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/utils/auth';

const NAV = [
    { href: '/dashboard', label: 'Dashboard',  icon: '▦' },
    { href: '/generate',  label: 'Generate',   icon: '✦' },
    { href: '/history',   label: 'History',    icon: '◷' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-[#0e0e14] text-white">

            {/* ── Sidebar ── */}
            <aside className="w-56 shrink-0 border-r border-white/6 flex flex-col py-6 px-4">

                {/* Logo */}
                <Link href="/" className="px-2 mb-8 font-black text-lg tracking-tight">
                    Resume<span className="text-violet-400">AI</span>
                </Link>

                {/* Nav */}
                <nav className="flex flex-col gap-1 flex-1">
                    {NAV.map(({ href, label, icon }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${active
                                        ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                                        : 'text-white/40 hover:text-white hover:bg-white/4'
                                    }`}
                            >
                                <span className="text-base w-4 text-center">{icon}</span>
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/25 hover:text-red-400 hover:bg-red-500/6 transition-all duration-200 mt-4"
                >
                    <span className="text-base w-4 text-center">→</span>
                    Log out
                </button>
            </aside>

            {/* ── Content ── */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}