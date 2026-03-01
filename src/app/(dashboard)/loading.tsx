"use client";

export default function DashboardLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin" />
                </div>
                <div className="space-y-4 text-center">
                    <p className="text-white text-xs font-black tracking-[0.5em] uppercase animate-pulse">
                        Synchronizing
                    </p>
                    <div className="h-[2px] w-48 bg-white/10 overflow-hidden relative">
                        <div className="absolute inset-0 bg-white/40 animate-[loading_1.5s_infinite_ease-in-out]" />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
