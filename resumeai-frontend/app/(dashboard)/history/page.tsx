'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import Link from 'next/link';

type Generation = {
    _id: string;
    type: string;
    createdAt: string;
};

function Skeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-white/4 rounded-2xl animate-pulse" />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center text-3xl mb-5">
                ◷
            </div>
            <p className="text-white font-semibold mb-2">No generations yet</p>
            <p className="text-white/35 text-sm mb-6">Your study sessions will appear here after your first generation.</p>
            <Link
                href="/generate"
                className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
                ✦ Start generating
            </Link>
        </div>
    );
}

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
    full:        { icon: '✦', label: 'Full generation', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    summary:     { icon: '📄', label: 'Summary',        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    test:        { icon: '📝', label: 'Quiz',           color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    flashcards:  { icon: '🃏', label: 'Flashcards',    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    development: { icon: '💬', label: 'Open Q&A',      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
};

function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1)    return 'Just now';
    if (diffMins < 60)   return `${diffMins}m ago`;
    if (diffHours < 24)  return `${diffHours}h ago`;
    if (diffDays < 7)    return `${diffDays}d ago`;
    return d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HistoryPage() {
    const [data, setData]           = useState<Generation[]>([]);
    const [page, setPage]           = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');

    useEffect(() => {
        fetchData();
    }, [page]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api(`/generation?page=${page}&limit=10`);
            setData(res.data ?? []);
            setTotalPages(res.totalPages ?? 1);
        } catch {
            setError('Could not load history.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl space-y-7">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">History</h1>
                    <p className="text-white/35 text-sm mt-1">All your past study sessions</p>
                </div>
                <Link
                    href="/generate"
                    className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                    ✦ New
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* List */}
            {loading ? (
                <Skeleton />
            ) : data.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-2">
                    {data.map((item) => {
                        const meta = TYPE_META[item.type] ?? TYPE_META.full;
                        return (
                            <Link
                                key={item._id}
                                href={`/history/${item._id}`}
                                className="group flex items-center gap-4 bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl px-5 py-4 transition-all duration-200"
                            >
                                {/* Icon */}
                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base shrink-0 ${meta.color}`}>
                                    {meta.icon}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm">{meta.label}</p>
                                    <p className="text-white/30 text-xs mt-0.5">{formatDate(item.createdAt)}</p>
                                </div>

                                {/* Arrow */}
                                <span className="text-white/15 group-hover:text-violet-400 transition-colors text-sm shrink-0">
                                    →
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 text-sm border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                    >
                        ← Previous
                    </button>

                    <span className="text-white/25 text-sm">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 text-sm border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}