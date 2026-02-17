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
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/40">
            <div className="mb-7">
                <h1 className="text-2xl font-black tracking-tight">{title}</h1>
                <p className="text-white/35 text-sm mt-1.5">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}