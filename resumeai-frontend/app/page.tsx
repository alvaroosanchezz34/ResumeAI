import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="text-center space-y-8">
            <h1 className="text-5xl font-semibold tracking-tight">
                Study smarter with AI
            </h1>

            <p className="text-white/60 max-w-2xl mx-auto text-lg">
                Transform long texts into summaries, test questions, development questions and flashcards instantly.
            </p>

            <div className="flex justify-center gap-4">
                <Link
                    href="/register"
                    className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-200 transition duration-200"
                >
                    Get started
                </Link>

                <Link
                    href="/pricing"
                    className="border border-white/20 px-6 py-3 rounded-md text-sm hover:border-white/40 hover:bg-white/5 transition duration-200"
                >
                    View pricing
                </Link>
            </div>
            <div className="mt-32 grid md:grid-cols-3 gap-10 text-left">
                <div className="bg-[#111111] border border-white/10 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Smart Summaries</h3>
                    <p className="text-white/60 text-sm">
                        Convert complex texts into clear and concise summaries in seconds.
                    </p>
                </div>

                <div className="bg-[#111111] border border-white/10 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Auto Test Questions</h3>
                    <p className="text-white/60 text-sm">
                        Generate multiple-choice and development questions automatically.
                    </p>
                </div>

                <div className="bg-[#111111] border border-white/10 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Flashcards Ready</h3>
                    <p className="text-white/60 text-sm">
                        Instantly create flashcards to accelerate memorization.
                    </p>
                </div>
            </div>
        </div>
    );
}
