import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="space-y-16">

            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight">
                    Pricing
                </h1>
                <p className="text-white/60">
                    Choose the plan that fits your study needs.
                </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid md:grid-cols-4 gap-6">

                {/* Free */}
                <div className="bg-[#111111] border border-white/10 p-6 rounded-lg space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Free</h3>
                        <p className="text-3xl font-bold mt-2">€0</p>
                    </div>

                    <ul className="text-sm text-white/60 space-y-2">
                        <li>• 5 generations / day</li>
                        <li>• Basic summaries</li>
                        <li>• Flashcards</li>
                    </ul>

                    <Link
                        href="/register"
                        className="block text-center border border-white/20 py-2 rounded-md hover:border-white/40 transition"
                    >
                        Get started
                    </Link>
                </div>

                {/* Premium (DESTACADO) */}
                <div className="bg-[#141414] border border-white/20 p-6 rounded-lg space-y-6 scale-105">
                    <div>
                        <h3 className="text-lg font-semibold">Premium</h3>
                        <p className="text-3xl font-bold mt-2">€9.99</p>
                        <p className="text-white/50 text-sm">per month</p>
                    </div>

                    <ul className="text-sm text-white/70 space-y-2">
                        <li>• 50 generations / day</li>
                        <li>• Advanced AI quality</li>
                        <li>• Unlimited history</li>
                        <li>• Language selection</li>
                    </ul>

                    <button
                        className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition"
                    >
                        Upgrade
                    </button>
                </div>

                {/* Premium Plus */}
                <div className="bg-[#111111] border border-white/10 p-6 rounded-lg space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Premium Plus</h3>
                        <p className="text-3xl font-bold mt-2">€19.99</p>
                        <p className="text-white/50 text-sm">per month</p>
                    </div>

                    <ul className="text-sm text-white/60 space-y-2">
                        <li>• 200 generations / day</li>
                        <li>• Exam mode</li>
                        <li>• Export to PDF</li>
                        <li>• Priority processing</li>
                    </ul>

                    <button
                        className="w-full border border-white/20 py-2 rounded-md hover:border-white/40 transition"
                    >
                        Upgrade
                    </button>
                </div>

                {/* Custom */}
                <div className="bg-[#111111] border border-white/10 p-6 rounded-lg space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Custom</h3>
                        <p className="text-3xl font-bold mt-2">From €49</p>
                    </div>

                    <ul className="text-sm text-white/60 space-y-2">
                        <li>• Unlimited generations</li>
                        <li>• Multi-user access</li>
                        <li>• White-label</li>
                        <li>• Dedicated support</li>
                    </ul>

                    <button
                        className="w-full border border-white/20 py-2 rounded-md hover:border-white/40 transition"
                    >
                        Contact us
                    </button>
                </div>

            </div>
        </div>
    );
}
