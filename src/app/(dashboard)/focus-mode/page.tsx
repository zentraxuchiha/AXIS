"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const POMODORO_MINUTES = 25;
const BREAK_MINUTES = 5;

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

export default function FocusModePage() {
    const { data: sessions, mutate } = useSWR("/api/focus-sessions", fetcher);

    const [secondsLeft, setSecondsLeft] = useState(POMODORO_MINUTES * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [label, setLabel] = useState("");
    const [sessionCount, setSessionCount] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const totalDuration = isBreak ? BREAK_MINUTES * 60 : POMODORO_MINUTES * 60;
    const progress = ((totalDuration - secondsLeft) / totalDuration) * 100;

    const todaySessions = sessions?.filter((s: any) => {
        const d = new Date(s.date);
        const now = new Date();
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }) || [];

    const logSession = async () => {
        await fetch("/api/focus-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label: label || "Deep Work", durationMinutes: POMODORO_MINUTES }),
        });
        setSessionCount((c) => c + 1);
        mutate();
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSecondsLeft((s) => {
                    if (s <= 1) {
                        clearInterval(intervalRef.current!);
                        setIsRunning(false);
                        if (!isBreak) {
                            logSession();
                            setIsBreak(true);
                            return BREAK_MINUTES * 60;
                        } else {
                            setIsBreak(false);
                            return POMODORO_MINUTES * 60;
                        }
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning, isBreak]);

    const handleReset = () => {
        setIsRunning(false);
        setIsBreak(false);
        setSecondsLeft(POMODORO_MINUTES * 60);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <header className="relative pt-10 pb-6 border-b-4 border-white flex items-end justify-between">
                <div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase text-white leading-none">
                        {isBreak ? "Break" : "Focus"}
                    </h1>
                    <p className="text-xs tracking-[0.4em] font-bold mt-4 uppercase opacity-60">
                        {isBreak ? "Recovery Phase" : "Deep Work Engine"}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-black text-white">{todaySessions.length}</div>
                    <p className="text-[0.6rem] tracking-[0.3em] uppercase font-bold opacity-50 mt-1">TODAY</p>
                </div>
            </header>

            {/* Timer Section */}
            <div className="flex flex-col items-center gap-8 py-6">
                {/* Label Input */}
                {!isBreak && (
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="WHAT ARE YOU WORKING ON?"
                        disabled={isRunning}
                        className="w-full max-w-md bg-transparent border-b-2 border-white/20 focus:border-white outline-none py-2 text-center text-sm font-bold uppercase tracking-widest text-white placeholder:text-white/20 transition-colors disabled:opacity-30"
                    />
                )}

                {/* Progress Ring / Timer Display */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* SVG Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
                        <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                        <circle
                            cx="128" cy="128" r="120"
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeDasharray={`${2 * Math.PI * 120}`}
                            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="text-center">
                        <div className={`text-6xl font-black tracking-tighter tabular-nums ${isBreak ? "opacity-50" : "text-white"}`}>
                            {formatTime(secondsLeft)}
                        </div>
                        {isBreak && (
                            <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase mt-2 opacity-50">BREAK</p>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsRunning((r) => !r)}
                        className="bg-white text-black text-sm font-black tracking-[0.3em] uppercase px-10 py-3 hover:bg-white/80 transition-colors"
                    >
                        {isRunning ? "PAUSE" : "START"}
                    </button>
                    <button
                        onClick={handleReset}
                        className="border-2 border-white/20 hover:border-white text-sm font-black tracking-[0.3em] uppercase px-6 py-3 transition-colors"
                    >
                        RESET
                    </button>
                </div>
            </div>

            {/* Session Progress Bar */}
            <div className="space-y-2">
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 h-1 transition-colors duration-500 ${i < (todaySessions.length % 4) || (todaySessions.length > 0 && todaySessions.length % 4 === 0) ? "bg-white" : "bg-white/10"}`}
                        />
                    ))}
                </div>
                <p className="text-[0.6rem] font-black tracking-[0.3em] uppercase opacity-40">
                    {todaySessions.length} SESSION{todaySessions.length !== 1 ? "S" : ""} COMPLETED TODAY — {Math.floor(todaySessions.length / 4)} FULL CYCLE{Math.floor(todaySessions.length / 4) !== 1 ? "S" : ""}
                </p>
            </div>

            {/* Recent Sessions */}
            {todaySessions.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase border-b border-white/20 pb-2 opacity-50">TODAY&apos;S SESSIONS</p>
                    {todaySessions.slice(0, 5).map((s: any, i: number) => (
                        <div key={s._id || i} className="border border-white/10 p-3 flex items-center justify-between">
                            <span className="text-xs font-black tracking-widest uppercase opacity-70">{s.label}</span>
                            <span className="text-[0.6rem] font-bold tracking-[0.2em] uppercase opacity-40">{s.durationMinutes} MIN</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
