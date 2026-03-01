"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DURATIONS = [15, 30, 45, 60, 90, 120, 150, 180, 240];

export default function StudyTrackerPage() {
    const { data: sessions, mutate } = useSWR("/api/study-sessions", fetcher);
    const [subject, setSubject] = useState("");
    const [duration, setDuration] = useState(60);
    const [notes, setNotes] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const now = new Date();
    const todaySessions = useMemo(() => (sessions || []).filter((s: any) => {
        const d = new Date(s.date);
        return d.toDateString() === now.toDateString();
    }), [sessions]);

    const todayMins = todaySessions.reduce((sum: number, s: any) => sum + s.durationMinutes, 0);

    // 7-day bar chart
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const weekData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
        const mins = (sessions || []).filter((s: any) => {
            const d = new Date(s.date);
            return d >= day && d <= dayEnd;
        }).reduce((sum: number, s: any) => sum + s.durationMinutes, 0);
        return { label: DAY_LABELS[i], mins };
    }), [sessions]);

    const maxMins = Math.max(...weekData.map((d) => d.mins), 1);

    // Subject breakdown (this week)
    const subjectMap = useMemo(() => {
        const map: Record<string, number> = {};
        (sessions || []).filter((s: any) => new Date(s.date) >= monday).forEach((s: any) => {
            map[s.subject] = (map[s.subject] || 0) + s.durationMinutes;
        });
        return Object.entries(map).sort(([, a], [, b]) => b - a);
    }, [sessions]);

    const handleLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim()) return;
        await fetch("/api/study-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject: subject.trim(), durationMinutes: duration, notes }),
        });
        setSubject(""); setNotes(""); setIsAdding(false); mutate();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/study-sessions/${id}`, { method: "DELETE" });
        mutate();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="pt-10 pb-6 border-b-4 border-white flex items-end justify-between">
                <div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase text-white leading-none">Study</h1>
                    <p className="text-xs tracking-[0.4em] font-bold mt-4 uppercase opacity-60">Session Tracker</p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-black text-white">{(todayMins / 60).toFixed(1)}<span className="text-2xl opacity-40">h</span></div>
                    <p className="text-[0.6rem] tracking-[0.3em] uppercase font-bold opacity-50 mt-1">TODAY</p>
                </div>
            </header>

            {/* Log Form */}
            {!isAdding ? (
                <button onClick={() => setIsAdding(true)} className="border-2 border-white/20 hover:border-white text-xs font-black tracking-[0.3em] uppercase px-6 py-3 transition-all hover:bg-white hover:text-black">
                    + LOG SESSION
                </button>
            ) : (
                <form onSubmit={handleLog} className="border-2 border-white p-6 space-y-4">
                    <input autoFocus type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="SUBJECT..."
                        className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-sm font-bold uppercase tracking-widest text-white placeholder:text-white/30" />
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[0.5rem] font-black tracking-[0.3em] uppercase opacity-50">DURATION</label>
                            <span className="text-sm font-black">{duration} MIN</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {DURATIONS.map((d) => (
                                <button key={d} type="button" onClick={() => setDuration(d)}
                                    className={`text-[0.6rem] font-black tracking-widest uppercase px-3 py-1 border transition-all ${duration === d ? "bg-white text-black border-white" : "border-white/20 text-white/50"}`}>
                                    {d}m
                                </button>
                            ))}
                        </div>
                    </div>
                    <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="NOTES (OPTIONAL)..."
                        className="w-full bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-1 text-xs font-bold uppercase tracking-widest text-white/70 placeholder:text-white/20" />
                    <div className="flex gap-3">
                        <button type="submit" className="bg-white text-black text-xs font-black tracking-[0.3em] uppercase px-6 py-2">LOG</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="text-xs font-black uppercase opacity-40 hover:opacity-100">CANCEL</button>
                    </div>
                </form>
            )}

            {/* Weekly Bar Chart */}
            <div className="space-y-4">
                <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-50 border-b border-white/10 pb-2">THIS WEEK</p>
                <div className="flex items-end gap-3 h-32">
                    {weekData.map((d) => (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                            <div className="w-full flex flex-col justify-end h-full relative group">
                                {d.mins > 0 && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[0.5rem] font-black tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {(d.mins / 60).toFixed(1)}h
                                    </div>
                                )}
                                <div className="w-full bg-white transition-all duration-700" style={{ height: `${(d.mins / maxMins) * 100}%`, minHeight: d.mins > 0 ? "4px" : "0" }} />
                                {d.mins === 0 && <div className="w-full h-0.5 bg-white/10" />}
                            </div>
                            <span className="text-[0.5rem] font-black tracking-widest uppercase opacity-40">{d.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subject Breakdown */}
            {subjectMap.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-50 border-b border-white/10 pb-2">SUBJECTS THIS WEEK</p>
                    {subjectMap.map(([sub, mins]) => (
                        <div key={sub} className="flex items-center gap-4">
                            <span className="text-xs font-black tracking-widest uppercase flex-1 truncate opacity-70">{sub}</span>
                            <div className="flex-1 h-0.5 bg-white/10">
                                <div className="h-full bg-white" style={{ width: `${(mins / subjectMap[0][1]) * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold opacity-40 shrink-0">{(mins / 60).toFixed(1)}h</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Today's Sessions */}
            {todaySessions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-50 border-b border-white/10 pb-2">TODAY&apos;S LOG</p>
                    {todaySessions.map((s: any) => (
                        <div key={s._id} className="border border-white/10 p-3 flex items-center gap-4">
                            <span className="text-xs font-black tracking-widest uppercase flex-1">{s.subject}</span>
                            {s.notes && <span className="text-[0.6rem] opacity-40 italic truncate max-w-[120px]">{s.notes}</span>}
                            <span className="text-[0.6rem] font-bold tracking-widest uppercase opacity-40 shrink-0">{s.durationMinutes}m</span>
                            <button onClick={() => handleDelete(s._id)} className="text-white/20 hover:text-white transition-colors">✕</button>
                        </div>
                    ))}
                </div>
            )}

            {(!sessions || sessions.length === 0) && (
                <div className="border-2 border-dashed border-white/10 p-16 text-center">
                    <p className="text-xs font-black tracking-[0.4em] uppercase opacity-30">NO SESSIONS LOGGED</p>
                </div>
            )}
        </div>
    );
}
