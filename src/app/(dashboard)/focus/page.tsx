"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function FocusPage() {
    const { data: tasks, mutate: mutateTasks } = useSWR("/api/tasks", fetcher);
    const { data: habits, mutate: mutateHabits } = useSWR("/api/habits", fetcher);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newHabitName, setNewHabitName] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isAddingHabit, setIsAddingHabit] = useState(false);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTaskTitle, priority: 2 }),
        });

        setNewTaskTitle("");
        setIsAddingTask(false);
        mutateTasks();
    };

    const toggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
        await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isCompleted }),
        });
        mutateTasks();
    };

    const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
        e.stopPropagation();
        if (!confirm("DELETE THIS OBJECTIVE?")) return;
        await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        mutateTasks();
    };

    const handleCreateHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;

        await fetch("/api/habits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newHabitName }),
        });

        setNewHabitName("");
        setIsAddingHabit(false);
        mutateHabits();
    };

    const deleteHabit = async (e: React.MouseEvent, habitId: string) => {
        e.stopPropagation();
        if (!confirm("TERMINATE THIS HABIT?")) return;

        await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
        mutateHabits();
    };

    const checkInHabit = async (habitId: string) => {
        await fetch(`/api/habits/${habitId}/checkin`, { method: "POST" });
        mutateHabits();
    };

    return (
        <div className="space-y-10 md:space-y-16 animate-in fade-in duration-700 relative">
            {/* Header Section */}
            <header className="relative pt-6 md:pt-12 pb-8 border-b-4 border-white">
                <div className="absolute top-0 right-12 w-32 h-32 border-4 border-white transform rotate-45 opacity-20 pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none">
                        Focus
                    </h1>
                    <p className="text-white text-[0.6rem] md:text-xs tracking-[0.4em] font-bold mt-6 uppercase bg-black inline-block pr-4">Clarity breeds execution.</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8">
                {/* To-Do Section */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                        <h2 className="text-sm tracking-[0.4em] uppercase font-black">To-Do</h2>
                        <button
                            onClick={() => setIsAddingTask(!isAddingTask)}
                            className={`w-8 h-8 flex items-center justify-center bg-black text-white font-bold transition-transform duration-300 ${isAddingTask ? 'rotate-45' : 'hover:scale-110'}`}
                        >
                            +
                        </button>
                    </div>

                    {isAddingTask && (
                        <form onSubmit={handleCreateTask} className="flex gap-2">
                            <input
                                type="text"
                                autoFocus
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="ENTER OBJECTIVE..."
                                className="flex-1 bg-black border-4 border-white px-4 py-3 text-white font-bold tracking-widest uppercase placeholder:text-white/30 focus:outline-none focus:bg-white focus:text-black transition-colors"
                            />
                            <button type="submit" className="bg-white text-black border-4 border-white px-6 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                ADD
                            </button>
                        </form>
                    )}

                    <div className="space-y-4">
                        {!tasks ? (
                            <div className="h-16 bg-white/10 animate-pulse border-2 border-white/20" />
                        ) : !Array.isArray(tasks) || tasks.length === 0 ? (
                            <div className="p-8 border-4 border-dashed border-white/30 text-center">
                                <p className="text-white/50 text-sm font-bold tracking-widest uppercase">No active objectives.</p>
                            </div>
                        ) : (
                            tasks.map((task: any) => (
                                <div
                                    key={task._id}
                                    className={`group flex justify-between items-center p-4 border-2 transition-all cursor-pointer ${task.isCompleted ? 'border-white/20 bg-white/5 opacity-50' : 'border-white hover:bg-white hover:text-black'}`}
                                    onClick={() => toggleTaskComplete(task._id, !task.isCompleted)}
                                >
                                    <span className={`text-sm font-bold tracking-widest uppercase truncate pr-4 ${task.isCompleted ? 'line-through text-white/50' : 'text-white group-hover:text-black'}`}>
                                        {task.title}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.isCompleted ? 'border-white/50' : 'border-white group-hover:border-black'}`}>
                                            {task.isCompleted && <div className="w-3 h-3 bg-white" />}
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteTask(e, task._id)}
                                            className={`text-lg leading-none transition-colors ${task.isCompleted ? 'text-white/20 hover:text-white' : 'text-white/10 hover:text-red-500'}`}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Habits Section */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                        <h2 className="text-sm tracking-[0.4em] uppercase font-black">Habits</h2>
                        <button
                            onClick={() => setIsAddingHabit(!isAddingHabit)}
                            className={`w-8 h-8 flex items-center justify-center bg-black text-white font-bold transition-transform duration-300 ${isAddingHabit ? 'rotate-45' : 'hover:scale-110'}`}
                        >
                            +
                        </button>
                    </div>

                    {isAddingHabit && (
                        <form onSubmit={handleCreateHabit} className="flex gap-2 animate-in slide-in-from-top-4">
                            <input
                                type="text"
                                autoFocus
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                                placeholder="ENTER HABIT NAME..."
                                className="flex-1 bg-black border-4 border-white px-4 py-3 text-white font-bold tracking-widest uppercase placeholder:text-white/30 focus:outline-none focus:bg-white focus:text-black transition-colors"
                            />
                            <button type="submit" className="bg-white text-black border-4 border-white px-6 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                ADD
                            </button>
                        </form>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {!habits ? (
                            <div className="h-32 bg-white/10 animate-pulse border-2 border-white/20 sm:col-span-2" />
                        ) : !Array.isArray(habits) || habits.length === 0 ? (
                            <div className="p-8 border-4 border-dashed border-white/30 text-center sm:col-span-2">
                                <p className="text-white/50 text-sm font-bold tracking-widest uppercase">No active habits.</p>
                            </div>
                        ) : (
                            habits.map((habit: any) => (
                                <div
                                    key={habit._id}
                                    className="p-6 border-4 border-white flex flex-col justify-between aspect-square group cursor-pointer hover:bg-white transition-colors relative overflow-hidden"
                                    onClick={() => checkInHabit(habit._id)}
                                >
                                    <div className="absolute top-2 right-2 z-20">
                                        <button
                                            onClick={(e) => deleteHabit(e, habit._id)}
                                            className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white hover:bg-red-600 transition-all font-black"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full group-hover:bg-black/10 transition-colors pointer-events-none" />

                                    <span className="text-white text-xs tracking-[0.2em] uppercase font-bold break-words group-hover:text-black z-10">{habit.name}</span>

                                    <div className="flex justify-between items-end z-10 mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-white/50 uppercase tracking-widest font-bold group-hover:text-black/50">Streak</span>
                                            <span className="text-5xl font-black text-white group-hover:text-black tracking-tighter">{habit.currentStreak}</span>
                                        </div>
                                        <div className="w-8 h-8 border-2 border-white group-hover:border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all text-transparent pb-1">
                                            +
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
