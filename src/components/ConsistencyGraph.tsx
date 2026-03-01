"use client";

import { useMemo } from "react";

interface ConsistencyGraphProps {
    workouts: any[]; // Raw workout logs from /api/workouts
    filterType: "Bodyweight" | "Gym";
    daysToTrack?: number;
}

export default function ConsistencyGraph({ workouts, filterType, daysToTrack = 30 }: ConsistencyGraphProps) {

    // Generate the last N days (including today)
    const historyGrid = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter valid workouts mapped to the specific type (Bodyweight or Gym)
        const relevantWorkouts = workouts?.filter(w => w.type === filterType) || [];

        // Create a set of date strings (YYYY-MM-DD) that have a completed workout
        const completionDates = new Set(
            relevantWorkouts.map(w => {
                const date = new Date(w.date);
                date.setHours(0, 0, 0, 0);
                return date.toISOString().split('T')[0];
            })
        );

        const grid = [];
        for (let i = daysToTrack - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            grid.push({
                date: dateStr,
                isCompleted: completionDates.has(dateStr),
                label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            });
        }

        return grid;
    }, [workouts, filterType, daysToTrack]);

    const totalCompleted = historyGrid.filter(day => day.isCompleted).length;
    const completionRate = Math.round((totalCompleted / daysToTrack) * 100) || 0;

    return (
        <section className="space-y-6 animate-in fade-in duration-700">
            <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                <h2 className="text-sm tracking-[0.4em] uppercase font-black">30-Day Matrix</h2>
                <div className="flex items-center gap-4">
                    <span className="text-[0.6rem] font-bold tracking-[0.2em] opacity-50 uppercase">{filterType}</span>
                    <span className="text-xs font-black tabular-nums">{completionRate}% <span className="opacity-30">RATE</span></span>
                </div>
            </div>

            <div className="bg-black border-4 border-white p-6 relative overflow-hidden group">
                {/* Decorative background lines */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                <div className="relative z-10">
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-start">
                        {historyGrid.map((day, i) => (
                            <div
                                key={day.date}
                                title={day.label}
                                className={`w-6 h-6 border-2 transition-all duration-300 relative group/cell
                                    ${day.isCompleted
                                        ? "bg-white border-white scale-100"
                                        : "bg-transparent border-white/20 scale-95 hover:border-white/50"}`}
                            >
                                {/* Tooltip on hover */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[0.5rem] font-black tracking-widest px-2 py-1 opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase z-20 shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">
                                    {day.label} {day.isCompleted && '✓'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-between items-center border-t border-white/20 pt-4">
                        <div className="text-[0.6rem] font-black tracking-[0.3em] uppercase text-white/50">
                            Last {daysToTrack} Days
                        </div>
                        <div className="text-[0.6rem] font-black tracking-[0.3em] uppercase text-white/50 flex items-center gap-2">
                            <span>Missed</span>
                            <div className="w-3 h-3 border-2 border-white/20" />
                            <div className="w-3 h-3 bg-white border-2 border-white ml-2" />
                            <span>Executed</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
