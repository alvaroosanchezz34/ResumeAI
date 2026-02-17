'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../services/api';
import Link from 'next/link';

type Generation = {
    _id: string;
    type: string;
    title: string | null;
    language: string | null;
    createdAt: string;
    preview: string | null;
};

function Skeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-white/4 rounded-2xl animate-pulse" />
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
            <Link href="/generate" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                ✦ Start generating
            </Link>
        </div>
    );
}

const LANG_FLAG: Record<string, string> = {
    es: '🇪🇸', en: '🇺🇸', fr: '🇫🇷', de: '🇩🇪',
    it: '🇮🇹', pt: '🇵🇹', ca: '🏴', nl: '🇳🇱', ru: '🇷🇺'
};

function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
}

function DeleteBtn({ id, onDeleted }: { id: string; onDeleted: (id: string) => void }) {
    const [confirm, setConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            await api(`/generation/${id}`, { method: 'DELETE' });
            onDeleted(id);
        } catch {
            setLoading(false);
            setConfirm(false);
        }
    };

    if (!confirm) {
        return (
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm(true); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                title="Delete"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <button onClick={handleDelete} disabled={loading}
                className="px-2 py-1 rounded-lg text-red-400 bg-red-500/10 border border-red-500/20 text-[11px] font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-40">
                {loading ? '...' : 'Delete'}
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm(false); }}
                className="px-2 py-1 rounded-lg text-white/30 text-[11px] hover:text-white/60 transition-colors">
                Cancel
            </button>
        </div>
    );
}

export default function HistoryPage() {
    const [data, setData] = useState<Generation[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api(`/generation?page=${page}&limit=10`);
            setData(res.data ?? []);
            setTotalPages(res.totalPages ?? 1);
            setTotal(res.total ?? 0);
        } catch {
            setError('Could not load history.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDeleted = (deletedId: string) => {
        setData(prev => prev.filter(g => g._id !== deletedId));
        setTotal(prev => prev - 1);
    };

    return (
        <div className="p-8 max-w-3xl space-y-7">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">History</h1>
                    <p className="text-white/35 text-sm mt-1">
                        {total > 0 ? `${total} study session${total !== 1 ? 's' : ''}` : 'All your past study sessions'}
                    </p>
                </div>
                <Link href="/generate" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    ✦ New
                </Link>
            </div>

            {error && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            {loading ? <Skeleton /> : data.length === 0 ? <EmptyState /> : (
                <div className="space-y-2">
                    {data.map((item) => (
                        <Link key={item._id} href={`/history/${item._id}`}
                            className="group flex items-center gap-4 bg-white/[0.03] border border-white/8 hover:border-violet-500/30 rounded-2xl px-5 py-4 transition-all duration-200">
                            <div className="w-9 h-9 rounded-xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center text-base shrink-0">
                                ✦
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-white font-semibold text-sm truncate">
                                        {item.title || 'Study session'}
                                    </p>
                                    {item.language && LANG_FLAG[item.language] && (
                                        <span className="text-sm shrink-0" title={item.language}>{LANG_FLAG[item.language]}</span>
                                    )}
                                </div>
                                {item.preview && <p className="text-white/30 text-xs mt-0.5 truncate">{item.preview}</p>}
                                <p className="text-white/20 text-xs mt-1">{formatDate(item.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <DeleteBtn id={item._id} onDeleted={handleDeleted} />
                                <span className="text-white/15 group-hover:text-violet-400 transition-colors text-sm">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 text-sm border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                        ← Previous
                    </button>
                    <span className="text-white/25 text-sm">Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 text-sm border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}