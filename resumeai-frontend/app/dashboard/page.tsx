'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { logout } from '@/utils/auth';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">ResumeAI Dashboard</h1>
                    <button
                        onClick={logout}
                        className="text-sm text-red-500"
                    >
                        Logout
                    </button>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/generate"
                        className="block border p-4 hover:bg-gray-100"
                    >
                        ➜ Generate new summary
                    </Link>

                    <Link
                        href="/documents"
                        className="block border p-4 hover:bg-gray-100"
                    >
                        ➜ View my documents
                    </Link>
                </div>
            </div>
        </ProtectedRoute>
    );
}
