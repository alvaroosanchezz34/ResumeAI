'use client';

import Link from 'next/link';
import { logout } from '@/utils/auth';

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#0d0d0d] text-white">

            {/* Sidebar */}
            <aside className="w-60 border-r border-white/10 p-6 space-y-6">
                <h2 className="font-semibold text-lg">ResumeAI</h2>

                <nav className="flex flex-col space-y-3 text-sm text-white/70">
                    <Link href="/dashboard" className="hover:text-white">
                        Dashboard
                    </Link>
                    <Link href="/generate" className="hover:text-white">
                        Generate
                    </Link>
                    <Link href="/history" className="hover:text-white">
                        History
                    </Link>
                </nav>

                <button
                    onClick={logout}
                    className="text-red-400 text-sm mt-8"
                >
                    Logout
                </button>
            </aside>

            {/* Content */}
            <main className="flex-1 p-10">
                {children}
            </main>
        </div>
    );
}
