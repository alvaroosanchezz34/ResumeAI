import Link from 'next/link';

export default function DocumentCard({ doc }: { doc: any }) {
    return (
        <Link
            href={`/documents/${doc._id}`}
            className="block rounded-lg border bg-white p-4 hover:shadow"
        >
            <h3 className="font-semibold">{doc.title}</h3>
            <p className="text-sm text-gray-500">
                {new Date(doc.createdAt).toLocaleString()}
            </p>
        </Link>
    );
}
