"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

function StudentReview({ focusSessions, attendanceRecords }: { focusSessions: any[], attendanceRecords: any[] }) {
    // A study session is any focus session containing "Study", "Class", "Read", or "Academic" in the label
    const studyKeywords = ["study", "class", "read", "academic", "learn"];
    const studySessionsCount = Array.isArray(focusSessions)
        ? focusSessions.filter((s: any) => studyKeywords.some(kw => s.label?.toLowerCase().includes(kw))).length
        : 0;

    // Calculate global attendance
    let attendanceSync = "0%";
    if (Array.isArray(attendanceRecords) && attendanceRecords.length > 0) {
        const totalClasses = attendanceRecords.reduce((acc: number, curr: any) => acc + curr.totalClasses, 0);
        const attendedClasses = attendanceRecords.reduce((acc: number, curr: any) => acc + curr.attendedClasses, 0);
        if (totalClasses > 0) {
            attendanceSync = `${Math.round((attendedClasses / totalClasses) * 100)}%`;
        }
    }

    // Motivational Engine
    const [motivationSpeech, setMotivationSpeech] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const fetchMotivation = async () => {
            if (!focusSessions || !attendanceRecords) return;
            setAiLoading(true);
            try {
                const res = await fetch("/api/ai/motivation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        stats: { studySessionsCount, attendanceSync },
                        context: "review",
                        role: "student"
                    })
                });
                const data = await res.json();
                setMotivationSpeech(data.result || "I'm having a bit of trouble connecting to AXIS AI right now, but your stats look clear.");
            } catch (err) {
                console.error("AI Fetch Error:", err);
                setMotivationSpeech("AXIS AI is temporarily resting. Keep up your discipline!");
            } finally {
                setAiLoading(false);
            }
        };
        fetchMotivation();
    }, [studySessionsCount, attendanceSync]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Weekly Motivational Speech */}
            <div className="bg-white text-black p-6 border-l-8 border-black">
                <h3 className="text-[0.6rem] tracking-[0.4em] uppercase font-black opacity-50 mb-2">AXIS AI: Academic Directive</h3>
                <p className="text-lg font-black tracking-widest uppercase leading-snug min-h-[3rem]">
                    {aiLoading ? "Consulting academic directives..." : (motivationSpeech || "Building academic momentum.")}
                </p>
            </div>

            <h2 className="text-2xl font-black tracking-widest uppercase mb-4 border-l-8 border-white pl-4">Academic Review</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black border-2 border-white p-6">
                    <h3 className="text-sm tracking-[0.3em] font-bold uppercase opacity-60 mb-2">Study Sessions</h3>
                    <p className="text-4xl font-black">{studySessionsCount}</p>
                </div>
                <div className="bg-black border-2 border-white p-6">
                    <h3 className="text-sm tracking-[0.3em] font-bold uppercase opacity-60 mb-2">Attendance Sync</h3>
                    <p className="text-4xl font-black">{attendanceSync}</p>
                </div>
            </div>
            <div className="bg-white/5 border-2 border-dashed border-white/20 p-8 text-center mt-8">
                <p className="text-xs tracking-[0.3em] uppercase opacity-50 font-bold">Metrics bound to Focus and Attendance core systems.</p>
            </div>
        </div>
    );
}

function ProfessionalReview({ habits, focusSessions, goals }: { habits: any[], focusSessions: any[], goals: any[] }) {
    const maxStreak = Array.isArray(habits) ? Math.max(0, ...habits.map((h: any) => h.currentStreak)) : 0;

    // Calculate Focus Time in Hours
    const focusMinutes = Array.isArray(focusSessions) ? focusSessions.reduce((acc: number, curr: any) => acc + curr.durationMinutes, 0) : 0;
    const focusTimeStr = focusMinutes > 60 ? `${Math.floor(focusMinutes / 60)}H ${focusMinutes % 60}M` : `${focusMinutes}M`;

    // Calculate Goals Status
    let goalsStatus = "NO GOALS";
    if (Array.isArray(goals) && goals.length > 0) {
        const completed = goals.filter((g: any) => g.isCompleted).length;
        goalsStatus = `${completed}/${goals.length} DONE`;
    }

    // Motivational Engine
    const [motivationSpeech, setMotivationSpeech] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const fetchMotivation = async () => {
            if (!focusSessions || !goals) return;
            setAiLoading(true);
            try {
                const res = await fetch("/api/ai/motivation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        stats: { focusMinutes, maxStreak, goalsStatus },
                        context: "review",
                        role: "professional"
                    })
                });
                const data = await res.json();
                setMotivationSpeech(data.result || "AXIS AI is processing your data. Check back in a moment for your executive directive.");
            } catch (err) {
                console.error("AI Fetch Error:", err);
                setMotivationSpeech("Executive Intelligence connection lost. Maintain your baseline adherence.");
            } finally {
                setAiLoading(false);
            }
        };
        fetchMotivation();
    }, [focusMinutes, maxStreak, goalsStatus]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Weekly Motivational Speech */}
            <div className="bg-white text-black p-6 border-l-8 border-black">
                <h3 className="text-[0.6rem] tracking-[0.4em] uppercase font-black opacity-50 mb-2">AXIS AI: Executive Directive</h3>
                <p className="text-lg font-black tracking-widest uppercase leading-snug min-h-[3rem]">
                    {aiLoading ? "Generating executive directive..." : (motivationSpeech || "Maintaining executive baseline.")}
                </p>
            </div>

            <h2 className="text-2xl font-black tracking-widest uppercase mb-4 border-l-8 border-white pl-4">Executive Review</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-black border-2 border-white p-6">
                    <h3 className="text-sm tracking-[0.3em] font-bold uppercase opacity-60 mb-2">Focus Architecture</h3>
                    <p className="text-3xl font-black">{focusTimeStr}</p>
                </div>
                <div className="bg-black border-2 border-white p-6">
                    <h3 className="text-sm tracking-[0.3em] font-bold uppercase opacity-60 mb-2">Strategic Goals</h3>
                    <p className="text-3xl font-black">{goalsStatus}</p>
                </div>
                <div className="bg-black border-2 border-white p-6">
                    <h3 className="text-sm tracking-[0.3em] font-bold uppercase opacity-60 mb-2">Max Adherence</h3>
                    <p className="text-4xl font-black">{maxStreak}<span className="text-lg opacity-50 ml-1">D</span></p>
                </div>
            </div>
            <div className="bg-white/5 border-2 border-dashed border-white/20 p-8 text-center mt-8">
                <p className="text-xs tracking-[0.3em] uppercase opacity-50 font-bold italic">Analytical scaling in progress...</p>
            </div>
        </div>
    );
}

export default function ReviewClient({ userRole }: { userRole: string }) {
    // Both roles can see generic global app data, like Expense & Workouts & Tasks
    const { data: expenses } = useSWR("/api/expenses", fetcher);
    const { data: incomes } = useSWR("/api/income", fetcher);
    const { data: workouts } = useSWR("/api/workouts", fetcher);
    const { data: tasks } = useSWR("/api/tasks", fetcher);
    const { data: habits } = useSWR("/api/habits", fetcher);

    // Additional fetching for accurate Review metrics
    const { data: focusSessions } = useSWR("/api/focus-sessions", fetcher);
    const { data: attendance } = useSWR("/api/attendance", fetcher);
    const { data: goals } = useSWR("/api/goals", fetcher);

    // Calc generic aggregations
    const totalExpenses = Array.isArray(expenses) ? expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0) : 0;
    const totalIncomes = Array.isArray(incomes) ? incomes.reduce((acc: number, curr: any) => acc + curr.amount, 0) : 0;
    const netSpend = totalExpenses; // User screenshot shows "TOTAL SPEND", which is expenses
    const totalWorkoutMins = Array.isArray(workouts) ? workouts.reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0) : 0;
    const completedTasks = Array.isArray(tasks) ? tasks.filter((t: any) => t.isCompleted).length : 0;

    return (
        <div className="space-y-16 animate-in fade-in duration-700 relative">
            <header className="relative pt-12 pb-8 border-b-4 border-white">
                <div className="absolute top-0 right-12 w-32 h-32 border-4 border-white rounded-full opacity-20 pointer-events-none transform scale-y-50" />

                <div className="relative z-10">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none">
                        Review
                    </h1>
                    <p className="text-white text-xs tracking-[0.4em] font-bold mt-6 uppercase bg-black inline-block pr-4">Data dictates direction.</p>
                </div>
            </header>

            {/* Global Aggregation (Visible to everyone) */}
            <section>
                <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white] mb-6">
                    <h2 className="text-sm tracking-[0.4em] uppercase font-black">Global Metrics</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black border border-white/30 p-4">
                        <span className="text-[0.6rem] uppercase tracking-widest text-[#A0A0A0] block mb-1">Total Spend</span>
                        <span className="text-2xl font-black">₹{netSpend.toLocaleString()}</span>
                    </div>
                    <div className="bg-black border border-white/30 p-4">
                        <span className="text-[0.6rem] uppercase tracking-widest text-[#A0A0A0] block mb-1">Training Load</span>
                        <span className="text-2xl font-black">{totalWorkoutMins}<span className="text-xs opacity-50 ml-1">MIN</span></span>
                    </div>
                    <div className="bg-black border border-white/30 p-4">
                        <span className="text-[0.6rem] uppercase tracking-widest text-[#A0A0A0] block mb-1">Tasks Done</span>
                        <span className="text-2xl font-black">{completedTasks}</span>
                    </div>
                    <div className="bg-black border border-white/30 p-4">
                        <span className="text-[0.6rem] uppercase tracking-widest text-[#A0A0A0] block mb-1">AI Uses</span>
                        <span className="text-2xl font-black">N/A</span>
                    </div>
                </div>
            </section>

            {/* Role-Specific Review Aggregations */}
            <section>
                <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white] mb-6">
                    <h2 className="text-sm tracking-[0.4em] uppercase font-black">Role Insights</h2>
                </div>
                {userRole === 'student'
                    ? <StudentReview focusSessions={focusSessions || []} attendanceRecords={attendance || []} />
                    : <ProfessionalReview habits={habits || []} focusSessions={focusSessions || []} goals={goals || []} />
                }
            </section>

        </div>
    );
}
