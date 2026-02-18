'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../services/api';

type User = {
    _id: string;
    email: string;
    role: string;
    plan: string;
    status: string;
    createdAt: string;
    lastLogin: string | null;
    generations: number;
    usedToday: number;
};

type Stats = {
    totalUsers: number;
    totalGenerations: number;
    newUsersToday: number;
    generationsToday: number;
    plans: {
        free: number;
        premium: number;
        pro: number;
        admin: number;
        custom: number;
    };
};

const PLAN_BADGE: Record<string, string> = {
    free: 'text-white/50 bg-white/6 border-white/10',
    premium: 'text-violet-300 bg-violet-500/12 border-violet-500/25',
    pro: 'text-indigo-300 bg-indigo-500/12 border-indigo-500/25',
    admin: 'text-amber-300 bg-amber-500/12 border-amber-500/25',
    custom: 'text-emerald-300 bg-emerald-500/12 border-emerald-500/25',
};

const PLANS = ['free', 'premium', 'pro', 'custom', 'admin'];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
            <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
            <p className="text-2xl font-black text-white">{value}</p>
            {sub && <p className="text-white/25 text-xs mt-1">{sub}</p>}
        </div>
    );
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    // Cargar stats globales
    useEffect(() => {
        api('/admin/stats')
            .then(res => setStats(res.data))
            .catch(() => setError('Not authorized or failed to load.'));
    }, []);

    // Cargar usuarios
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api(`/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
            setUsers(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const changePlan = async (userId: string, plan: string) => {
        setUpdating(userId + '-plan');
        try {
            const res = await api(`/admin/users/${userId}/plan`, {
                method: 'PATCH',
                body: JSON.stringify({ plan })
            });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, plan: res.data.plan } : u));
        } catch (err: any) {
            alert(err.message || 'Failed to update plan');
        } finally {
            setUpdating(null);
        }
    };

    const toggleBan = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        if (!confirm(`${newStatus === 'banned' ? 'Ban' : 'Unban'} this user?`)) return;

        setUpdating(userId + '-status');
        try {
            const res = await api(`/admin/users/${userId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: res.data.status } : u));
        } catch (err: any) {
            alert(err.message || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const deleteUser = async (userId: string, email: string) => {
        if (!confirm(`Delete ${email} and ALL their data? This cannot be undone.`)) return;

        setUpdating(userId + '-delete');
        try {
            await api(`/admin/users/${userId}`, { method: 'DELETE' });
            setUsers(prev => prev.filter(u => u._id !== userId));
            setTotal(prev => prev - 1);
        } catch (err: any) {
            alert(err.message || 'Failed to delete user');
        } finally {
            setUpdating(null);
        }
    };

    if (error) return (
        <div className="p-8">
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
        </div>
    );

    return (
        <div className="page-container space-y-8 max-w-5xl">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Admin Panel</h1>
                    <p className="text-white/35 text-sm mt-1">{total} total users</p>
                </div>
                <span className="text-xs bg-amber-500/12 border border-amber-500/25 text-amber-300 px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider">
                    Admin
                </span>
            </div>

            {/* Stats globales */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total users" value={stats.totalUsers} sub="all time" />
                    <StatCard label="Total generations" value={stats.totalGenerations} sub="all time" />
                    <StatCard label="New users today" value={stats.newUsersToday} />
                    <StatCard label="Generations today" value={stats.generationsToday} />
                </div>
            )}

            {/* Plan breakdown */}
            {stats && (
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                    <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-4">Users by plan</p>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stats.plans).map(([plan, count]) => (
                            <div key={plan} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${PLAN_BADGE[plan] ?? PLAN_BADGE.free}`}>
                                <span className="capitalize">{plan}</span>
                                <span className="opacity-60">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Búsqueda */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search by email…"
                    className="flex-1 bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-violet-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors"
                />
                <button type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    Search
                </button>
                {search && (
                    <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                        className="border border-white/10 text-white/40 hover:text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
                        Clear
                    </button>
                )}
            </form>

            {/* Tabla */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                {/* Header tabla */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/6 text-[11px] text-white/25 font-medium uppercase tracking-wider">
                    <span>User</span>
                    <span>Plan</span>
                    <span>Status</span>
                    <span>Generations</span>
                    <span>Joined</span>
                    <span>Actions</span>
                </div>

                {loading ? (
                    <div className="space-y-0">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-16 bg-white/[0.02] animate-pulse border-b border-white/4 last:border-0" />
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-16 text-center text-white/30 text-sm">No users found</div>
                ) : (
                    <div>
                        {users.map(user => (
                            <div key={user._id}
                                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b border-white/4 last:border-0 items-center hover:bg-white/[0.02] transition-colors">

                                {/* Email + rol */}
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{user.email}</p>
                                    <p className="text-white/25 text-xs mt-0.5">
                                        {user.role === 'admin' && <span className="text-amber-400">admin · </span>}
                                        {user.usedToday} used today
                                    </p>
                                </div>

                                {/* Plan selector */}
                                <div>
                                    <select
                                        value={user.plan}
                                        disabled={updating === user._id + '-plan'}
                                        onChange={e => changePlan(user._id, e.target.value)}
                                        className={`appearance-none text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none transition-all
                                            ${PLAN_BADGE[user.plan] ?? PLAN_BADGE.free}
                                            ${updating === user._id + '-plan' ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80'}`}
                                    >
                                        {PLANS.map(p => (
                                            <option key={p} value={p} className="bg-[#1a1a2e] text-white capitalize">{p}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${user.status === 'active'
                                            ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                                            : 'text-red-300 bg-red-500/10 border-red-500/20'
                                        }`}>
                                        {user.status}
                                    </span>
                                </div>

                                {/* Generaciones */}
                                <div>
                                    <p className="text-white/60 text-sm">{user.generations}</p>
                                </div>

                                {/* Fecha */}
                                <div>
                                    <p className="text-white/40 text-xs">{formatDate(user.createdAt)}</p>
                                    {user.lastLogin && (
                                        <p className="text-white/20 text-[11px] mt-0.5">Last: {formatDate(user.lastLogin)}</p>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => toggleBan(user._id, user.status)}
                                        disabled={!!updating}
                                        title={user.status === 'banned' ? 'Unban' : 'Ban'}
                                        className={`p-1.5 rounded-lg border text-xs transition-all disabled:opacity-30
                                            ${user.status === 'banned'
                                                ? 'border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10'
                                                : 'border-amber-500/25 text-amber-400 hover:bg-amber-500/10'}`}
                                    >
                                        {updating === user._id + '-status' ? '…'
                                            : user.status === 'banned' ? '✓' : '⊘'}
                                    </button>

                                    <button
                                        onClick={() => deleteUser(user._id, user.email)}
                                        disabled={!!updating}
                                        title="Delete user"
                                        className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30 text-xs"
                                    >
                                        {updating === user._id + '-delete' ? '…' : '🗑'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
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