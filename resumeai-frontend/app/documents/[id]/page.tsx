'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/services/api';

export default function DocumentDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [doc, setDoc] = useState<any>(null);

    useEffect(() => {
        api(`/documents/${id}`).then(res => setDoc(res.document));
    }, [id]);

    if (!doc) {
        return (
            <ProtectedRoute>
                <div className="p-8">Loading...</div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen p-8 space-y-6">
                <h1 className="text-2xl font-bold">{doc.title}</h1>

                <h2 className="font-semibold">Summary</h2>
                <p>{doc.generated.summary}</p>

                <h2 className="font-semibold">Flashcards</h2>
                <ul className="list-disc ml-6">
                    {doc.generated.flashcards.map((f: any, i: number) => (
                        <li key={i}>
                            <strong>{f.front}:</strong> {f.back}
                        </li>
                    ))}
                </ul>
            </div>
        </ProtectedRoute>
    );
}
