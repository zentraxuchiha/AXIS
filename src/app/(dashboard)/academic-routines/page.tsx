"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function isCompletedToday(completedOn?: string) {
    if (!completedOn) return false;
    const d = new Date(completedOn);
    const today = new Date();
    return d.toDateString() === today.toDateString();
}

export default function AcademicRoutinesPage() {
    const { data: routines, mutate } = useSWR("/api/academic-routines", fetcher);
    const [selectedDay, setSelectedDay] = useState(() => {
        const d = new Date().getDay();
        return d === 0 ? 6 : d - 1; // Convert Sun=0 to Mon=0
    });
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [time, setTime] = useState("08:00");
    const [day, setDay] = useState(selectedDay);

    const filteredRoutines = useMemo(() =>
        (routines || []).filter((r: any) => r.dayOfWeek === selectedDay).sort((a: any, b: any) => a.time.localeCompare(b.time)),
        [routines, selectedDay]
    );

    const todayDone = filteredRoutines.filter((r: any) => isCompletedToday(r.completedOn)).length;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || time === undefined) return;
        await fetch("/api/academic-routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title.trim(), subject: subject.trim() || undefined, dayOfWeek: day, time }),
        });
        setTitle(""); setSubject(""); setIsAdding(false); mutate();
    };

    const handleToggle = async (id: string, done: boolean) => {
        const now = new Date().toISOString();
        // Optimistic update
        mutate(
            routines?.map((r: any) => r._id === id ? { ...r, completedOn: done ? null : now } : r),
            false
        );
        await fetch(`/api/academic-routines/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completedOn: done ? null : now }),
        });
        mutate();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("DELETE THIS ROUTINE?")) return;
        mutate(routines?.filter((r: any) => r._id !== id), false);
        await fetch(`/api/academic-routines/${id}`, { method: "DELETE" });
        mutate();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="pt-10 pb-6 border-b-4 border-white flex items-end justify-between">
                <div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase text-white leading-none">Routines</h1>
                    <p className="text-xs tracking-[0.4em] font-bold mt-4 uppercase opacity-60">Academic Schedule</p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-black text-white">{todayDone}<span className="text-white/30 text-2xl">/{filteredRoutines.length}</span></div>
                    <p className="text-[0.6rem] tracking-[0.3em] uppercase font-bold opacity-50 mt-1">DONE TODAY</p>
                </div>
            </header>

            {/* Day Tabs */}
            <div className="flex gap-1 border-b-2 border-white/10 pb-0">
                {DAYS.map((d, i) => (
                    <button key={d} onClick={() => setSelectedDay(i)}
                        className={`text-[0.6rem] font-black tracking-[0.2em] uppercase px-3 py-2 transition-all border-b-2 -mb-0.5 ${selectedDay === i ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"}`}>
                        {d}
                    </button>
                ))}
            </div>

            {/* Add Button */}
            {!isAdding ? (
                <button onClick={() => { setDay(selectedDay); setIsAdding(true); }}
                    className="border-2 border-white/20 hover:border-white text-xs font-black tracking-[0.3em] uppercase px-6 py-3 transition-all hover:bg-white hover:text-black">
                    + ADD ROUTINE
                </button>
            ) : (
                <form onSubmit={handleCreate} className="border-2 border-white p-6 space-y-4">
                    <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ROUTINE TITLE..."
                        className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-sm font-bold uppercase tracking-widest text-white placeholder:text-white/30" />
                    <div className="flex flex-wrap gap-4">
                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="SUBJECT (OPTIONAL)"
                            className="bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-1 text-xs font-bold uppercase tracking-widest text-white/70 placeholder:text-white/20" />
                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                            className="bg-black border border-white/20 text-white text-xs p-2 font-bold" />
                        <div className="flex gap-1">
                            {DAYS.map((d, i) => (
                                <button key={d} type="button" onClick={() => setDay(i)}
                                    className={`text-[0.55rem] font-black tracking-widest uppercase px-2 py-1 border transition-all ${day === i ? "bg-white text-black border-white" : "border-white/20 text-white/40"}`}>
                                    {d[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="bg-white text-black text-xs font-black tracking-[0.3em] uppercase px-6 py-2">ADD</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="text-xs font-black uppercase opacity-40 hover:opacity-100">CANCEL</button>
                    </div>
                </form>
            )}

            {/* Routine List */}
            <div className="space-y-3">
                {filteredRoutines.map((routine: any) => {
                    const done = isCompletedToday(routine.completedOn);
                    return (
                        <div
                            key={routine._id}
                            className={`group flex items-stretch border-2 transition-all duration-300 ${done ? "border-white/10 opacity-40" : "border-white/20 hover:border-white"}`}
                        >
                            {/* Left: Time Block */}
                            <div className="flex flex-col items-center justify-center px-5 border-r border-white/10 min-w-[72px]">
                                <span className="text-lg font-black tabular-nums text-white leading-none">
                                    {routine.time.slice(0, 5)}
                                </span>
                            </div>

                            {/* Center: Title + Subject */}
                            <div className="flex-1 flex flex-col justify-center px-5 py-4 min-w-0">
                                <h3 className={`font-black tracking-widest uppercase text-base leading-tight truncate ${done ? "line-through opacity-50" : ""}`}>
                                    {routine.title}
                                </h3>
                                {routine.subject && (
                                    <span className="mt-1 text-xs font-bold tracking-[0.25em] uppercase text-white/50">
                                        {routine.subject}
                                    </span>
                                )}
                            </div>

                            {/* Right: Checkbox + Delete */}
                            <div className="flex items-center gap-3 px-5 border-l border-white/10">
                                <button
                                    onClick={() => handleToggle(routine._id, done)}
                                    className={`w-7 h-7 border-2 shrink-0 flex items-center justify-center transition-all ${done ? "bg-white border-white text-black" : "border-white/30 hover:border-white text-transparent"}`}
                                >
                                    ✓
                                </button>
                                <button
                                    onClick={() => handleDelete(routine._id)}
                                    className="text-white/30 hover:text-white text-xs font-black tracking-widest transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filteredRoutines.length === 0 && (
                    <div className="border-2 border-dashed border-white/10 p-12 text-center">
                        <p className="text-xs font-black tracking-[0.4em] uppercase opacity-30">NO ROUTINES FOR {DAYS[selectedDay]}</p>
                    </div>
                )}
            </div>

        </div>
    );
}
