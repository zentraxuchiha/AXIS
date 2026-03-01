"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function DashboardPage() {
    const {
        data: tasks,
        mutate: mutateTasks,
        error: tasksError,
    } = useSWR("/api/tasks", fetcher);

    const {
        data: habits,
        mutate: mutateHabits,
        error: habitsError,
    } = useSWR("/api/habits", fetcher);

    const [motivation, setMotivation] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    // Fetch Real AI Motivation
    useEffect(() => {
        const fetchMotivation = async () => {
            if (!tasks || !habits) return;
            setAiLoading(true);
            try {
                const res = await fetch("/api/ai/motivation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        stats: { pendingTasks: tasks.filter((t: any) => !t.isCompleted).length, habitStreaks: habits.map((h: any) => h.currentStreak) },
                        context: "today"
                    })
                });
                const data = await res.json();
                setMotivation(data.result);
            } catch (err) {
                console.error("AI Fetch Error:", err);
            } finally {
                setAiLoading(false);
            }
        };

        fetchMotivation();
    }, [tasks, habits]);

    if (tasksError || habitsError) {
        return (
            <div className="pt-32 text-red-400 text-xs tracking-widest uppercase">
                Failed to load dashboard: {tasksError?.info?.error || habitsError?.info?.error || "Unknown Error"}
            </div>
        );
    }

    if (!tasks || !habits) {
        return (
            <div className="pt-32 text-white text-xs tracking-widest uppercase animate-pulse">
                Loading dashboard…
            </div>
        );
    }

    const priorityFocus = Array.isArray(tasks)
        ? tasks
            .filter((t: any) => !t.isCompleted)
            .sort((a: any, b: any) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return (
                    new Date(a.dueDate).getTime() -
                    new Date(b.dueDate).getTime()
                );
            })[0]
        : null;

    const activeHabits = Array.isArray(habits) ? habits.slice(0, 3) : [];

    const date = new Date()
        .toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        .toUpperCase();



    const toggleTaskComplete = async (taskId: string) => {
        await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isCompleted: true }),
        });
        mutateTasks();
    };

    const checkInHabit = async (habitId: string) => {
        await fetch(`/api/habits/${habitId}/checkin`, { method: "POST" });
        mutateHabits();
    };

    const canCheckIn = (habit: any) => {
        if (!habit.lastCompletedDate) return true;
        return (
            new Date(habit.lastCompletedDate).toDateString() !==
            new Date().toDateString()
        );
    };

    return (
        <div className="space-y-10 md:space-y-16 animate-in fade-in duration-700 relative">
            {/* Header */}
            <header className="relative pt-6 md:pt-12 pb-8 border-b border-white/20">
                <div className="relative z-10">
                    <p className="text-white/60 text-[0.6rem] md:text-xs tracking-[0.4em] font-bold mb-4">
                        {date}
                    </p>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight uppercase bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-none">
                        Today
                    </h1>
                    <p className="mt-4 text-white/40 text-[0.6rem] md:text-[0.65rem] tracking-widest uppercase font-bold border-l-2 border-white/20 pl-3 min-h-[1.5rem] leading-relaxed">
                        {aiLoading ? "AI is generating your anchor for today..." : (motivation || "Win the morning, win the day.")}
                    </p>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-10">
                {/* Priority Focus */}
                <section className="border border-white/10 relative overflow-hidden hover:border-white/30 transition">
                    <h2 className="px-6 py-4 text-xs tracking-[0.3em] uppercase font-bold border-b border-white/10 text-white/80">
                        Priority Focus
                    </h2>

                    <div className="p-8">
                        {priorityFocus ? (
                            <div className="border border-white/20 p-6 space-y-6">
                                <h3 className="text-white text-2xl font-black uppercase tracking-tight">
                                    {priorityFocus.title}
                                </h3>

                                <p className="text-white/40 text-xs tracking-widest uppercase">
                                    {priorityFocus.dueDate
                                        ? `Due ${new Date(
                                            priorityFocus.dueDate
                                        ).toLocaleDateString()}`
                                        : "No due date"}
                                </p>

                                <button
                                    onClick={() => toggleTaskComplete(priorityFocus._id)}
                                    className="w-full border border-white text-white hover:bg-white hover:text-black transition py-4 font-bold tracking-[0.2em] uppercase"
                                >
                                    Mark Complete
                                </button>
                            </div>
                        ) : (
                            <div className="border border-dashed border-white/20 p-10 text-center space-y-6">
                                <p className="text-white/40 text-xs tracking-widest uppercase">
                                    No priority set for today
                                </p>
                                <a
                                    href="/focus"
                                    className="inline-block border border-white/40 px-6 py-3 text-xs tracking-widest uppercase font-bold text-white hover:bg-white hover:text-black transition"
                                >
                                    + Add priority task
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                {/* Active Habits */}
                <section className="border border-white/10 relative overflow-hidden hover:border-white/30 transition">
                    <h2 className="px-6 py-4 text-xs tracking-[0.3em] uppercase font-bold border-b border-white/10 text-white/80">
                        Active Habits
                    </h2>

                    <div className="p-8 space-y-4">
                        {activeHabits.length > 0 ? (
                            activeHabits.map((habit: any) => {
                                const allowed = canCheckIn(habit);

                                return (
                                    <div
                                        key={habit._id}
                                        onClick={() =>
                                            allowed && checkInHabit(habit._id)
                                        }
                                        className={`flex justify-between items-center border-b border-white/10 pb-4 transition ${allowed
                                            ? "cursor-pointer hover:bg-white/5"
                                            : "opacity-40 pointer-events-none"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-5 h-5 border border-white/60" />
                                            <span className="text-white font-bold uppercase tracking-wide">
                                                {habit.name}
                                            </span>
                                        </div>

                                        <span className="text-white/80 text-xs tracking-widest uppercase">
                                            🔥 {habit.currentStreak} Day
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-10 border border-dashed border-white/20 text-center space-y-6">
                                <p className="text-white/40 text-xs tracking-widest uppercase">
                                    No habits tracked
                                </p>
                                <a
                                    href="/focus"
                                    className="inline-block border border-white/40 px-6 py-3 text-xs tracking-widest uppercase font-bold text-white hover:bg-white hover:text-black transition"
                                >
                                    + Start a habit
                                </a>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}