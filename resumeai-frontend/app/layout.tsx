import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ResumeAI — Turn any text into study material',
    description: 'Paste lecture notes, chapters or articles and get summaries, flashcards, quizzes and open questions in seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-[#0e0e14] text-white antialiased">
                {children}
            </body>
        </html>
    );
}