'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import Link from 'next/link';

export default function HistoryPage() {
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchData();
    }, [page]);

    const fetchData = async () => {
        const res = await api(`/generation?page=${page}`);
        console.log("HISTORY RESPONSE:", res);
        setData(res.data);
        setTotalPages(res.totalPages);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-semibold">History</h1>

            <div className="space-y-4">
                {data.map((item) => (
                    <Link
                        key={item._id}
                        href={`/history/${item._id}`}
                        className="block bg-[#111111] border border-white/10 rounded-lg p-5 hover:border-white/30 transition"
                    >
                        <div className="flex justify-between">
                            <span className="capitalize text-white/80">
                                {item.type}
                            </span>
                            <span className="text-white/40 text-sm">
                                {new Date(item.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="flex gap-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-white/20 rounded disabled:opacity-30"
                >
                    Previous
                </button>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-white/20 rounded disabled:opacity-30"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
