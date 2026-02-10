import './globals.css';
import Link from 'next/link';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="max-w-5xl mx-auto flex justify-between items-center p-4">
            <Link href="/dashboard" className="font-bold text-lg">
              ResumeAI
            </Link>

            <nav className="space-x-4 text-sm">
              <Link href="/generate">Generate</Link>
              <Link href="/documents">Documents</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
