"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PRIORITY_LABELS: Record<number, string> = { 1: "HIGH", 2: "MED", 3: "LOW" };
const PRIORITY_COLORS: Record<number, string> = {
    1: "bg-white text-black",
    2: "bg-white/20 text-white",
    3: "bg-white/10 text-white/60",
};

function getDaysLeft(targetDate?: string) {
    if (!targetDate) return null;
    const diff = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
}

export default function GoalsPage() {
    const { data: goals, mutate } = useSWR("/api/goals", fetcher);
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [priority, setPriority] = useState(2);

    const activeGoals = goals?.filter((g: any) => !g.isCompleted) || [];
    const doneGoals = goals?.filter((g: any) => g.isCompleted) || [];
    const total = goals?.length || 0;
    const done = doneGoals.length;
    const ratio = total > 0 ? Math.round((done / total) * 100) : 0;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        await fetch("/api/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, targetDate: targetDate || undefined, priority }),
        });
        setTitle(""); setTargetDate(""); setPriority(2); setIsAdding(false);
        mutate();
    };

    const toggleGoal = async (id: string, isCompleted: boolean) => {
        // Optimistic update
        mutate(
            goals?.map((g: any) => g._id === id ? { ...g, isCompleted: !isCompleted } : g),
            false
        );
        await fetch(`/api/goals/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isCompleted: !isCompleted }),
        });
        mutate();
    };

    const deleteGoal = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("DELETE THIS GOAL?")) return;
        mutate(goals?.filter((g: any) => g._id !== id), false);
        await fetch(`/api/goals/${id}`, { method: "DELETE" });
        mutate();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <header className="relative pt-10 pb-6 border-b-4 border-white flex items-end justify-between">
                <div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase text-white leading-none">Goals</h1>
                    <p className="text-xs tracking-[0.4em] font-bold mt-4 uppercase opacity-60">Objective Registry</p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-black text-white">{done}<span className="text-white/30 text-2xl">/{total}</span></div>
                    <p className="text-[0.6rem] tracking-[0.3em] uppercase font-bold opacity-50 mt-1">ACHIEVED</p>
                </div>
            </header>

            {/* Progress Bar */}
            {total > 0 && (
                <div className="space-y-2">
                    <div className="w-full h-1 bg-white/10">
                        <div
                            className="h-full bg-white transition-all duration-700"
                            style={{ width: `${ratio}%` }}
                        />
                    </div>
                    <p className="text-[0.6rem] font-black tracking-[0.3em] uppercase opacity-40">{ratio}% COMPLETE</p>
                </div>
            )}

            {/* Add Goal Toggle */}
            <div>
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="border-2 border-white/20 hover:border-white text-xs font-black tracking-[0.3em] uppercase px-6 py-3 transition-all duration-300 hover:bg-white hover:text-black"
                    >
                        + NEW OBJECTIVE
                    </button>
                ) : (
                    <form onSubmit={handleCreate} className="border-2 border-white p-6 space-y-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="OBJECTIVE TITLE..."
                            autoFocus
                            className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-sm font-bold uppercase tracking-widest text-white placeholder:text-white/30 transition-colors"
                        />
                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[0.5rem] font-black tracking-[0.3em] uppercase opacity-50">DEADLINE</label>
                                <input
                                    type="date"
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    className="bg-black border border-white/20 text-white text-xs p-2 font-bold tracking-widest uppercase"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[0.5rem] font-black tracking-[0.3em] uppercase opacity-50">PRIORITY</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={`text-[0.6rem] font-black tracking-[0.2em] px-3 py-1 border transition-all ${priority === p ? "border-white bg-white text-black" : "border-white/20 text-white/50"}`}
                                        >
                                            {PRIORITY_LABELS[p]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="bg-white text-black text-xs font-black tracking-[0.3em] uppercase px-6 py-2 hover:bg-white/80 transition-colors">
                                COMMIT
                            </button>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-xs font-black tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity">
                                CANCEL
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Active Goals */}
            {activeGoals.length > 0 && (
                <div className="space-y-3">
                    {activeGoals.map((goal: any) => {
                        const daysLeft = getDaysLeft(goal.targetDate);
                        return (
                            <div key={goal._id} className="group border-2 border-white/20 hover:border-white bg-black p-5 flex items-center gap-4 transition-all duration-300">
                                <button
                                    onClick={() => toggleGoal(goal._id, goal.isCompleted)}
                                    className="w-6 h-6 border-2 border-white/40 hover:border-white shrink-0 transition-colors flex items-center justify-center"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black tracking-widest uppercase text-sm text-white truncate">{goal.title}</h3>
                                    {daysLeft !== null && (
                                        <p className={`text-[0.6rem] font-bold tracking-[0.25em] uppercase mt-1 ${daysLeft < 0 ? "text-white/80" : daysLeft <= 7 ? "text-white/70" : "opacity-40"}`}>
                                            {daysLeft < 0 ? `${Math.abs(daysLeft)}D OVERDUE` : daysLeft === 0 ? "DUE TODAY" : `${daysLeft}D LEFT`}
                                        </p>
                                    )}
                                </div>
                                <span className={`text-[0.5rem] font-black tracking-[0.2em] uppercase px-2 py-1 shrink-0 ${PRIORITY_COLORS[goal.priority]}`}>
                                    {PRIORITY_LABELS[goal.priority]}
                                </span>
                                <button
                                    onClick={(e) => deleteGoal(e, goal._id)}
                                    className="text-white/20 hover:text-white text-lg leading-none shrink-0 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Completed Goals */}
            {doneGoals.length > 0 && (
                <div className="space-y-3 opacity-40">
                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase border-b border-white/20 pb-2">ACHIEVED</p>
                    {doneGoals.map((goal: any) => (
                        <div key={goal._id} className="border border-white/10 p-4 flex items-center gap-4">
                            <button
                                onClick={() => toggleGoal(goal._id, goal.isCompleted)}
                                className="w-6 h-6 border-2 border-white bg-white shrink-0 flex items-center justify-center text-black text-xs"
                            >
                                ✓
                            </button>
                            <h3 className="flex-1 font-black tracking-widest uppercase text-sm line-through truncate">{goal.title}</h3>
                            <button onClick={(e) => deleteGoal(e, goal._id)} className="text-white/20 hover:text-white text-lg leading-none shrink-0 transition-colors">✕</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!goals || goals.length === 0 && (
                <div className="border-2 border-dashed border-white/10 p-16 text-center">
                    <p className="text-xs font-black tracking-[0.4em] uppercase opacity-30">NO OBJECTIVES DEFINED</p>
                </div>
            )}
        </div>
    );
}
