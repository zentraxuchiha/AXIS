"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TimeAnalyticsPage() {
    const { data, isLoading } = useSWR("/api/focus-sessions/analytics", fetcher);

    const weekData: { day: string; minutes: number }[] = data?.weekData || [];
    const topLabels: { label: string; hours: number }[] = data?.topLabels || [];
    const stats = data?.stats;

    const maxMinutes = Math.max(...weekData.map((d) => d.minutes), 1);

    const statCards = [
        { label: "Today", value: stats ? `${stats.todayHours}h` : "—" },
        { label: "This Week", value: stats ? `${stats.weekHours}h` : "—" },
        { label: "Best Day", value: stats ? stats.bestDay : "—" },
        { label: "Total Sessions", value: stats ? stats.totalSessions : "—" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <header className="pt-10 pb-6 border-b-4 border-white flex items-end justify-between">
                <div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase text-white leading-none">Time</h1>
                    <p className="text-xs tracking-[0.4em] font-bold mt-4 uppercase opacity-60">Focus Analytics</p>
                </div>
                {stats && (
                    <div className="text-right">
                        <div className="text-5xl font-black text-white">{stats.weekHours}<span className="text-2xl text-white/30">h</span></div>
                        <p className="text-[0.6rem] tracking-[0.3em] uppercase font-bold opacity-50 mt-1">THIS WEEK</p>
                    </div>
                )}
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statCards.map((c) => (
                    <div key={c.label} className="border-2 border-white/20 p-4 flex flex-col gap-1">
                        <p className="text-[0.5rem] font-black tracking-[0.3em] uppercase opacity-40">{c.label}</p>
                        <p className="text-3xl font-black text-white tracking-tight">{isLoading ? "…" : c.value}</p>
                    </div>
                ))}
            </div>

            {/* 7-Day Bar Chart */}
            <div className="space-y-4">
                <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-50 border-b border-white/10 pb-2">THIS WEEK</p>
                <div className="flex items-end gap-3 h-40">
                    {weekData.map((d) => {
                        const heightPct = maxMinutes > 0 ? (d.minutes / maxMinutes) * 100 : 0;
                        return (
                            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <div className="w-full relative group flex flex-col justify-end" style={{ height: "100%" }}>
                                    {d.minutes > 0 && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[0.5rem] font-black tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {(d.minutes / 60).toFixed(1)}h
                                        </div>
                                    )}
                                    <div
                                        className="w-full bg-white transition-all duration-700"
                                        style={{ height: `${heightPct}%`, minHeight: d.minutes > 0 ? "4px" : "0" }}
                                    />
                                    {d.minutes === 0 && <div className="w-full h-1 bg-white/10" />}
                                </div>
                                <span className="text-[0.6rem] font-black tracking-widest uppercase opacity-40">{d.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Focus Labels */}
            {topLabels.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-50 border-b border-white/10 pb-2">TOP FOCUS AREAS</p>
                    {topLabels.map((item, i) => {
                        const maxHrs = topLabels[0].hours;
                        const widthPct = (item.hours / maxHrs) * 100;
                        return (
                            <div key={item.label} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black tracking-widest uppercase opacity-70">{item.label}</span>
                                    <span className="text-xs font-bold tracking-widest opacity-40">{item.hours}h</span>
                                </div>
                                <div className="w-full h-0.5 bg-white/10">
                                    <div
                                        className="h-full bg-white transition-all duration-700"
                                        style={{ width: `${widthPct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && weekData.every((d) => d.minutes === 0) && (
                <div className="border-2 border-dashed border-white/10 p-16 text-center">
                    <p className="text-xs font-black tracking-[0.4em] uppercase opacity-30">NO SESSIONS LOGGED YET</p>
                    <p className="text-[0.6rem] uppercase tracking-widest opacity-20 mt-2">COMPLETE A FOCUS SESSION TO SEE ANALYTICS</p>
                </div>
            )}
        </div>
    );
}
