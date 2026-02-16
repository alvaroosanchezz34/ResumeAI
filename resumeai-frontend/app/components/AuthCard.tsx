export default function AuthCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-8 space-y-6 shadow-xl">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-white/50 text-sm">{subtitle}</p>
            </div>

            {children}
        </div>
    );
}
