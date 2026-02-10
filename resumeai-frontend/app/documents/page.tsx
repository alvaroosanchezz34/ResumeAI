'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/services/api';
import Link from 'next/link';
import DocumentCard from '@/components/DocumentCard';

export default function DocumentsPage() {
    const [docs, setDocs] = useState<any[]>([]);

    useEffect(() => {
        api('/documents').then(res => setDocs(res.documents));
    }, []);

    return (
        <ProtectedRoute>
            <div className="min-h-screen p-8 space-y-6">
                <h1 className="text-2xl font-bold">My documents</h1>

                {docs.length === 0 && <p>No documents yet</p>}

                <div className="space-y-3">

                    <div className="grid grid-cols-1 gap-4">
                        {docs.map(doc => (
                            <DocumentCard key={doc._id} doc={doc} />
                        ))}
                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
}
