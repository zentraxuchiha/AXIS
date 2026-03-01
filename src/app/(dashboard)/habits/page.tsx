"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getWeekGrid(history: string[]) {
    const grid = [];
    const now = new Date();
    // Get Monday of the current week
    const dayOfWeek = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const done = history.some((d) => {
            const h = new Date(d);
            h.setHours(0, 0, 0, 0);
            return h.getTime() === day.getTime();
        });
        grid.push(done);
    }
    return grid;
}

function isDoneToday(lastCompletedDate?: string) {
    if (!lastCompletedDate) return false;
    const last = new Date(lastCompletedDate);
    const today = new Date();
    return (
        last.getDate() === today.getDate() &&
        last.getMonth() === today.getMonth() &&
        last.getFullYear() === today.getFullYear()
    );
}

export default function HabitsPage() {
    const { data: habits, mutate } = useSWR("/api/habits", fetcher);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");

    const totalStreak = habits?.reduce((sum: number, h: any) => sum + (h.currentStreak || 0), 0) || 0;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        await fetch("/api/habits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName }),
        });
        setNewName(""); setIsAdding(false);
        mutate();
    };

    const handleCheckin = async (id: string) => {
        // Optimistic update: mark as done today
        const today = new Date();
        mutate(
            habits?.map((h: any) => h._id === id
                ? { ...h, lastCompletedDate: today.toISOString(), currentStreak: (h.currentStreak || 0) + 1 }
                : h),
            false
        );
        await fetch(`/api/habits/${id}/checkin`, { method: "POST" });
        mutate();
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("TERMINATE THIS HABIT?")) return;
        mutate(habits?.filter((h: any) => h._id !== id), false);
        await fetch(`/api/habits/${id}`, { method: "DELETE" });
        mutate();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <header className="relative pt-10 pb-6 border-b-4 border-white flex items-end justify-between">
                <div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase text-white leading-none">Habits</h1>
                    <p className="text-xs tracking-[0.4em] font-bold mt-4 uppercase opacity-60">Discipline Registry</p>
                </div>
                {totalStreak > 0 && (
                    <div className="text-right">
                        <div className="text-5xl font-black text-white">🔥 {totalStreak}</div>
                        <p className="text-[0.6rem] tracking-[0.3em] uppercase font-bold opacity-50 mt-1">TOTAL STREAK</p>
                    </div>
                )}
            </header>

            {/* Add Habit */}
            <div>
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="border-2 border-white/20 hover:border-white text-xs font-black tracking-[0.3em] uppercase px-6 py-3 transition-all duration-300 hover:bg-white hover:text-black"
                    >
                        + NEW HABIT
                    </button>
                ) : (
                    <form onSubmit={handleCreate} className="border-2 border-white p-6 flex gap-4 items-center">
                        <input
                            autoFocus
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="HABIT NAME..."
                            className="flex-1 bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-sm font-bold uppercase tracking-widest text-white placeholder:text-white/30 transition-colors"
                        />
                        <button type="submit" className="bg-white text-black text-xs font-black tracking-[0.3em] uppercase px-5 py-2 hover:bg-white/80 transition-colors shrink-0">
                            LOCK IN
                        </button>
                        <button type="button" onClick={() => setIsAdding(false)} className="text-xs font-black tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity shrink-0">
                            ✕
                        </button>
                    </form>
                )}
            </div>

            {/* Habit List */}
            <div className="space-y-4">
                {habits?.map((habit: any) => {
                    const doneToday = isDoneToday(habit.lastCompletedDate);
                    const weekGrid = getWeekGrid(habit.history || []);
                    return (
                        <div
                            key={habit._id}
                            className="group border-2 border-white/20 hover:border-white bg-black p-5 transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                {/* Check button */}
                                <button
                                    onClick={() => !doneToday && handleCheckin(habit._id)}
                                    className={`w-8 h-8 border-2 shrink-0 flex items-center justify-center text-sm font-black transition-all duration-300 ${doneToday ? "border-white bg-white text-black" : "border-white/30 hover:border-white text-transparent"}`}
                                >
                                    ✓
                                </button>

                                {/* Name and Streak */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-black tracking-widest uppercase text-sm truncate transition-colors ${doneToday ? "text-white" : "text-white/70"}`}>
                                        {habit.name}
                                    </h3>
                                    <p className="text-[0.6rem] font-bold tracking-[0.25em] uppercase opacity-50 mt-0.5">
                                        🔥 {habit.currentStreak || 0} DAY STREAK
                                    </p>
                                </div>

                                {/* 7-Day Grid */}
                                <div className="flex gap-1 shrink-0">
                                    {weekGrid.map((done, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <div className={`w-4 h-4 border transition-all duration-300 ${done ? "bg-white border-white" : "border-white/20"}`} />
                                            <span className="text-[0.45rem] font-black tracking-wider uppercase opacity-30">{DAYS[i]}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={(e) => handleDelete(e, habit._id)}
                                    className="text-white/20 hover:text-white text-lg leading-none shrink-0 ml-2 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {(!habits || habits.length === 0) && (
                <div className="border-2 border-dashed border-white/10 p-16 text-center">
                    <p className="text-xs font-black tracking-[0.4em] uppercase opacity-30">NO HABITS DEFINED</p>
                </div>
            )}
        </div>
    );
}
