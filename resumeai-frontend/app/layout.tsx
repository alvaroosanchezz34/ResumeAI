// app/layout.tsx
import './global.css';
import Link from 'next/link';
import { headers } from 'next/headers';

export default async function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    const isLanding = pathname === '/' || pathname === '';

    return (
        <html lang="en">
            <body className="bg-[#0e0e14] text-white antialiased">
                {isLanding ? (
                    // La landing tiene su propio layout completo
                    <>{children}</>
                ) : (
                    <div className="min-h-screen flex flex-col">
                        <header className="border-b border-white/8 bg-[#0e0e14]">
                            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                                <Link href="/" className="font-bold tracking-tight text-white">
                                    Resume<span className="text-violet-400">AI</span>
                                </Link>
                                <div className="space-x-6 text-sm text-white/50">
                                    <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                                    <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                                </div>
                            </div>
                        </header>
                        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
                            {children}
                        </main>
                    </div>
                )}
            </body>
        </html>
    );
}