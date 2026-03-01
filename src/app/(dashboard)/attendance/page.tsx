"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getStatusBadge(pct: number) {
    if (pct >= 85) return { label: "SAFE", cls: "bg-white text-black" };
    if (pct >= 75) return { label: "WARNING", cls: "bg-white/30 text-white" };
    return { label: "DANGER", cls: "bg-white/10 text-white border border-white/30" };
}

export default function AttendancePage() {
    const { data, mutate } = useSWR("/api/attendance", fetcher);
    const [subject, setSubject] = useState("");
    const [status, setStatus] = useState<"present" | "absent">("present");
    const [type, setType] = useState<"theory" | "practical">("theory");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [isAdding, setIsAdding] = useState(false);

    const subjects: any[] = data?.subjects || [];
    const records: any[] = data?.records || [];

    const overallPct = subjects.length
        ? Math.round(subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length)
        : 0;

    const handleLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim()) return;
        await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject: subject.trim(), status, type, date }),
        });
        setSubject("");
        setIsAdding(false);
        mutate();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("DELETE THIS RECORD?")) return;
        mutate(
            { ...data, records: data?.records?.filter((r: any) => r._id !== id) },
            false
        );
        await fetch(`/api/attendance/${id}`, { method: "DELETE" });
        mutate();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <header className="pt-10 pb-6 border-b-4 border-white flex items-end justify-between">
                <div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase text-white leading-none">Attendance</h1>
                    <p className="text-xs tracking-[0.4em] font-bold mt-4 uppercase opacity-60">Class Registry</p>
                </div>
                {subjects.length > 0 && (
                    <div className="text-right">
                        <div className={`text-5xl font-black ${overallPct >= 75 ? "text-white" : "text-white/60"}`}>
                            {overallPct}<span className="text-2xl opacity-40">%</span>
                        </div>
                        <p className="text-[0.6rem] tracking-[0.3em] uppercase font-bold opacity-50 mt-1">OVERALL</p>
                    </div>
                )}
            </header>

            {/* Log Button */}
            {!isAdding ? (
                <button
                    onClick={() => setIsAdding(true)}
                    className="border-2 border-white/20 hover:border-white text-xs font-black tracking-[0.3em] uppercase px-6 py-3 transition-all hover:bg-white hover:text-black"
                >
                    + LOG CLASS
                </button>
            ) : (
                <form onSubmit={handleLog} className="border-2 border-white p-6 space-y-6">
                    <input
                        autoFocus
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="SUBJECT NAME..."
                        className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-sm font-bold uppercase tracking-widest text-white placeholder:text-white/30"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[0.55rem] font-black tracking-widest uppercase opacity-40">Status</label>
                            <div className="flex gap-2">
                                {(["present", "absent"] as const).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={`flex-1 text-[0.6rem] font-black tracking-[0.2em] uppercase px-4 py-2 border transition-all ${status === s ? "bg-white text-black border-white" : "border-white/20 text-white"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[0.55rem] font-black tracking-widest uppercase opacity-40">Class Type</label>
                            <div className="flex gap-2">
                                {(["theory", "practical"] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`flex-1 text-[0.6rem] font-black tracking-[0.2em] uppercase px-4 py-2 border transition-all ${type === t ? "bg-white text-black border-white" : "border-white/20 text-white"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-[0.55rem] font-black tracking-widest uppercase opacity-40">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-black border border-white/20 text-white text-xs p-2 font-bold focus:border-white outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="bg-white text-black text-xs font-black tracking-[0.3em] uppercase px-6 py-2 hover:bg-white/80"
                        >
                            SUBMIT
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="text-xs font-black uppercase opacity-40 hover:opacity-100"
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            )}

            {/* Subject Breakdown */}
            {subjects.length > 0 && (
                <div className="space-y-4">
                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-50 border-b border-white/10 pb-2">
                        SUBJECT BREAKDOWN
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.sort((a, b) => a.percentage - b.percentage).map((s) => {
                            const badge = getStatusBadge(s.percentage);
                            return (
                                <div key={s.name} className="border-2 border-white/20 p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-black tracking-widest uppercase text-base">{s.name}</h3>
                                            <div className="mt-2 flex gap-2">
                                                <span className={`text-[0.5rem] font-black tracking-widest uppercase px-2 py-0.5 ${badge.cls}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black tabular-nums">
                                                {s.percentage}<span className="text-sm opacity-40">%</span>
                                            </div>
                                            <p className="text-[0.5rem] font-bold tracking-widest uppercase opacity-40">
                                                {s.present}/{s.total} TOTAL
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full h-1 bg-white/10">
                                        <div
                                            className={`h-full transition-all duration-700 ${s.percentage < 75 ? "bg-white/40" : "bg-white"}`}
                                            style={{ width: `${s.percentage}%` }}
                                        />
                                    </div>

                                    {/* Sub-breakdown: Theory & Practical */}
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                        <div>
                                            <p className="text-[0.5rem] font-black tracking-widest uppercase opacity-40 mb-1">Theory</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-sm font-black text-white">{s.theory.percentage}%</span>
                                                <span className="text-[0.5rem] font-bold text-white/30 uppercase tracking-tighter mb-0.5">
                                                    {s.theory.present}/{s.theory.total}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[0.5rem] font-black tracking-widest uppercase opacity-40 mb-1">Practical</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-sm font-black text-white">{s.practical.percentage}%</span>
                                                <span className="text-[0.5rem] font-bold text-white/30 uppercase tracking-tighter mb-0.5">
                                                    {s.practical.present}/{s.practical.total}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {s.percentage < 75 && (
                                        <p className="text-[0.5rem] font-bold tracking-widest uppercase opacity-50 bg-white/5 p-2 text-center italic">
                                            LACKING {Math.ceil((0.75 * s.total - s.present) / (1 - 0.75))} SESSIONS FOR 75%
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Records */}
            {records.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-50 border-b border-white/10 pb-2">
                        RECENT ACTIVITY
                    </p>
                    <div className="flex flex-col border border-white/10 divide-y divide-white/5">
                        {records.slice(0, 15).map((r: any) => (
                            <div key={r._id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-all group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black tracking-widest uppercase">{r.subject}</span>
                                        <span className="text-[0.45rem] font-black tracking-widest uppercase px-1.5 border border-white/20 text-white/40">
                                            {r.type}
                                        </span>
                                    </div>
                                    <p className="text-[0.55rem] tracking-widest uppercase opacity-30 mt-0.5 font-bold">
                                        {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`text-[0.55rem] font-black tracking-widest uppercase px-2 py-0.5 ${r.status === "present" ? "bg-white text-black" : "border border-white/20 opacity-40 text-white"
                                            }`}
                                    >
                                        {r.status}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(r._id)}
                                        className="text-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(!data || subjects.length === 0) && (
                <div className="border-2 border-dashed border-white/10 p-16 text-center">
                    <p className="text-xs font-black tracking-[0.4em] uppercase opacity-30">NO LOGS DETECTED</p>
                </div>
            )}
        </div>
    );
}
