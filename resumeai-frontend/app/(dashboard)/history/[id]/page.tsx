'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../services/api';

export default function HistoryDetail({ params }: any) {
    const [generation, setGeneration] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await api(`/generation/${params.id}`);
        setGeneration(res.data);
    };

    if (!generation) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-semibold capitalize">
                {generation.type}
            </h1>

            <div className="bg-[#111111] border border-white/10 rounded-lg p-6">
                <pre className="text-white/70 text-sm whitespace-pre-wrap">
                    {JSON.stringify(generation.result, null, 2)}
                </pre>
            </div>
        </div>
    );
}
