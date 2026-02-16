'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../services/api';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        api('/generation/stats')
            .then(res => setStats(res.data))
            .catch(console.error);
    }, []);

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-semibold">Dashboard</h1>

            <div className="grid md:grid-cols-4 gap-6">

                <Card title="Plan">
                    {stats.plan}
                </Card>

                <Card title="Total Generations">
                    {stats.totalGenerations}
                </Card>

                <Card title="Used Today">
                    {stats.usedToday}
                </Card>

                <Card title="Last Generation">
                    {stats.lastGeneration
                        ? new Date(stats.lastGeneration).toLocaleString()
                        : 'None'}
                </Card>
                <div className="md:col-span-4">
                    <Card title="Daily Usage">
                        <div className="space-y-3">

                            <div className="flex justify-between text-sm text-white/60">
                                <span>{stats.usedToday} / {stats.limit}</span>
                                <span>{stats.remaining} left</span>
                            </div>

                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-white h-2 transition-all duration-500"
                                    style={{
                                        width: `${Math.min(
                                            (stats.usedToday / stats.limit) * 100,
                                            100
                                        )}%`
                                    }}
                                />
                            </div>

                            {stats.remaining <= 1 && (
                                <p className="text-xs text-red-400">
                                    You're close to your daily limit.
                                </p>
                            )}

                        </div>
                    </Card>
                </div>

            </div>

        </div>
    );
}

function Card({ title, children }: any) {
    return (
        <div className="bg-[#111111] border border-white/10 p-6 rounded-xl">
            <p className="text-sm text-white/50 mb-2">{title}</p>
            <div className="text-2xl font-semibold">
                {children}
            </div>
        </div>
    );
}

