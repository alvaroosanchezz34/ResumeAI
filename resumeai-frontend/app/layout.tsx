import '../app/global.css';
import Link from 'next/link';

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-[#0d0d0d] text-white antialiased">
                <div className="min-h-screen flex flex-col">

                    {/* Navbar */}
                    <header className="border-b border-white/10 bg-[#0d0d0d]">
                        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                            <Link href="/" className="font-semibold tracking-tight">
                                ResumeAI
                            </Link>

                            <div className="space-x-6 text-sm text-white/70">
                                <Link href="/pricing" className="hover:text-white transition duration-200">
                                    Pricing
                                </Link>
                                <Link href="/login" className="hover:text-white transition duration-200">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
                        {children}
                    </main>

                </div>
            </body>
        </html>
    );
}
