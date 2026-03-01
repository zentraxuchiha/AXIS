"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import ConsistencyGraph from "@/components/ConsistencyGraph";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DEFAULT_BODYWEIGHT = [
    "Pushups", "Squats", "Plank", "Burpees", "Lunges", "Pull-ups", "Dips", "Mountain Climbers"
];

export default function TrainStudent() {
    const { data: allRoutines, mutate: mutateRoutines } = useSWR("/api/workout-routines", fetcher);
    const { data: pastWorkouts, mutate: mutateWorkouts } = useSWR("/api/workouts", fetcher);

    const [selectedDay, setSelectedDay] = useState(() => {
        const d = new Date().getDay();
        return d === 0 ? 6 : d - 1; // Mon=0, Sun=6
    });

    // --- Hydration State ---
    const [waterIntake, setWaterIntake] = useState(0); // in ml

    // --- BMI State ---
    const [height, setHeight] = useState<string>(""); // cm
    const [weight, setWeight] = useState<string>(""); // kg

    // --- Add Exercise State ---
    const [isAdding, setIsAdding] = useState(false);
    const [newExName, setNewExName] = useState("");
    const [customExName, setCustomExName] = useState("");

    // --- Persistence & Daily Reset ---
    useEffect(() => {
        const today = new Date().toDateString();

        // Hydration Init
        const savedHydration = localStorage.getItem("axis_student_hydration");
        if (savedHydration) {
            const parsed = JSON.parse(savedHydration);
            if (parsed.date === today) {
                setWaterIntake(parsed.amount);
            } else {
                setWaterIntake(0);
            }
        }

        // BMI Init
        const savedBMI = localStorage.getItem("axis_student_bmi");
        if (savedBMI) {
            const parsed = JSON.parse(savedBMI);
            setHeight(parsed.height || "");
            setWeight(parsed.weight || "");
        }
    }, []);

    useEffect(() => {
        const today = new Date().toDateString();
        localStorage.setItem("axis_student_hydration", JSON.stringify({ date: today, amount: waterIntake }));
    }, [waterIntake]);

    useEffect(() => {
        localStorage.setItem("axis_student_bmi", JSON.stringify({ height, weight }));
    }, [height, weight]);

    // Current Routine for Selected Day
    const currentRoutine = useMemo(() => {
        return allRoutines?.find((r: any) => r.dayOfWeek === selectedDay) || { exercises: [] };
    }, [allRoutines, selectedDay]);

    // --- Handlers ---
    const updateWater = (delta: number) => {
        setWaterIntake(prev => Math.max(0, Math.min(prev + delta, 5000)));
    };

    const handleAddExercise = async () => {
        const name = customExName.trim() || newExName;
        if (!name) return;

        const updatedExercises = [
            ...currentRoutine.exercises,
            { name, type: 'bodyweight', target: '3 SETS', done: false }
        ];

        // Optimistic update
        mutateRoutines(
            allRoutines?.map((r: any) => r.dayOfWeek === selectedDay ? { ...r, exercises: updatedExercises } : r) ||
            [{ dayOfWeek: selectedDay, exercises: updatedExercises }],
            false
        );

        await fetch("/api/workout-routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dayOfWeek: selectedDay, exercises: updatedExercises }),
        });

        setNewExName("");
        setCustomExName("");
        setIsAdding(false);
        mutateRoutines();
    };

    const toggleExercise = async (index: number) => {
        const updatedExercises = currentRoutine.exercises.map((ex: any, i: number) =>
            i === index ? { ...ex, done: !ex.done } : ex
        );

        mutateRoutines(
            allRoutines?.map((r: any) => r.dayOfWeek === selectedDay ? { ...r, exercises: updatedExercises } : r),
            false
        );

        await fetch("/api/workout-routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dayOfWeek: selectedDay, exercises: updatedExercises }),
        });
        mutateRoutines();
    };

    const deleteExercise = async (index: number) => {
        const updatedExercises = currentRoutine.exercises.filter((_: any, i: number) => i !== index);

        mutateRoutines(
            allRoutines?.map((r: any) => r.dayOfWeek === selectedDay ? { ...r, exercises: updatedExercises } : r),
            false
        );

        await fetch("/api/workout-routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dayOfWeek: selectedDay, exercises: updatedExercises }),
        });
        mutateRoutines();
    };

    const handleFinishProtocol = async () => {
        const allDone = currentRoutine.exercises.every((ex: any) => ex.done);
        if (!allDone) {
            alert("EXECUTE ALL PROTOCOL EXERCISES BEFORE COMPLETION.");
            return;
        }

        await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "Bodyweight", durationMinutes: 45 }),
        });

        const resetExercises = currentRoutine.exercises.map((ex: any) => ({ ...ex, done: false }));
        await fetch("/api/workout-routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dayOfWeek: selectedDay, exercises: resetExercises }),
        });

        mutateRoutines();
        mutateWorkouts();
        alert("PROTOCOL EXECUTED AND LOGGED. ARCHIVING DAY.");
    };

    const droplets = Array.from({ length: 10 }); // 10 x 250ml = 2.5L goal

    // BMI Calculation
    const h = parseFloat(height);
    const w = parseFloat(weight);
    let bmi = 0;
    let bmiCategory = "PENDING";
    let bmiSuggestion = "ENTER HEIGHT & WEIGHT TO GENERATE PROTOCOL.";

    if (h > 0 && w > 0) {
        bmi = parseFloat((w / ((h / 100) * (h / 100))).toFixed(1));
        if (bmi < 18.5) {
            bmiCategory = "UNDERWEIGHT";
            bmiSuggestion = "Prioritize a caloric surplus (+300-500 kcal/day). Focus on compound strength training to build dense muscle mass.";
        } else if (bmi >= 18.5 && bmi < 24.9) {
            bmiCategory = "OPTIMAL";
            bmiSuggestion = "Maintain current caloric intake for maintenance. Continue progressive overload in bodyweight exercises.";
        } else if (bmi >= 25 && bmi < 29.9) {
            bmiCategory = "OVERWEIGHT";
            bmiSuggestion = "Implement a slight caloric deficit (-300 kcal/day). Increase daily step count and integrate HIIT routines.";
        } else {
            bmiCategory = "OBESE";
            bmiSuggestion = "Focus on a strict caloric deficit. Prioritize low-impact, steady-state cardio to protect joints.";
        }
    }

    return (
        <div className="space-y-16 animate-in fade-in duration-700 relative">
            {/* Header */}
            <header className="relative pt-12 pb-8 border-b-4 border-white">
                <div className="absolute top-0 right-12 w-32 h-32 border-4 border-white rounded-full opacity-20 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none">Train</h1>
                    <p className="text-white text-xs tracking-[0.4em] font-bold mt-6 uppercase bg-black inline-block pr-4">Student Schedule</p>
                </div>
            </header>

            {/* Day Selector */}
            <div className="flex flex-wrap gap-2 border-b-2 border-white/10 pb-4">
                {DAYS.map((d, i) => (
                    <button key={d} onClick={() => setSelectedDay(i)}
                        className={`text-[0.6rem] font-black tracking-[0.2em] uppercase px-4 py-2 transition-all border-2 ${selectedDay === i ? "bg-white text-black border-white" : "border-white/10 text-white/40 hover:border-white/30"}`}>
                        {d}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8">
                {/* Left Column: BMI + Routine */}
                <div className="space-y-12">
                    {/* BMI Section */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                            <h2 className="text-sm tracking-[0.4em] uppercase font-black">BMI Intelligence</h2>
                            <div className="w-4 h-4 border-2 border-black" />
                        </div>
                        <div className="bg-black border-4 border-white p-6 relative overflow-hidden group">
                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold tracking-[0.3em] uppercase opacity-50">Height (CM)</label>
                                        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175"
                                            className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-xl font-black tabular-nums text-white placeholder:text-white/20 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold tracking-[0.3em] uppercase opacity-50">Weight (KG)</label>
                                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70"
                                            className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-xl font-black tabular-nums text-white placeholder:text-white/20 transition-colors" />
                                    </div>
                                </div>
                                <div className="border-t border-white/20 pt-6 flex items-end justify-between">
                                    <div>
                                        <p className="text-[0.6rem] font-bold tracking-[0.3em] uppercase opacity-50 mb-1">Score</p>
                                        <div className="text-5xl font-black tracking-tighter tabular-nums leading-none">{bmi > 0 ? bmi : "--"}</div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[0.6rem] font-bold tracking-[0.3em] uppercase opacity-50 mb-1">Classification</p>
                                        <div className={`text-sm font-black tracking-widest uppercase px-3 py-1 border-2 ${bmi > 0 ? 'bg-white text-black border-white' : 'border-white/30 text-white/50'}`}>{bmiCategory}</div>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 mt-2">
                                    <p className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-white/40 mb-2">System Directive</p>
                                    <p className="text-xs leading-relaxed font-bold tracking-wider text-white/80">{bmiSuggestion}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Routine Section */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                            <h2 className="text-sm tracking-[0.4em] uppercase font-black">{DAYS[selectedDay]} Routine</h2>
                            <button onClick={() => setIsAdding(!isAdding)} className="text-[0.6rem] font-black tracking-[0.3em] uppercase hover:underline">
                                {isAdding ? "[CANCEL]" : "[+ ADD EXERCISE]"}
                            </button>
                        </div>

                        {isAdding && (
                            <div className="bg-white text-black p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase mb-2">Select Exercise</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {DEFAULT_BODYWEIGHT.map(ex => (
                                        <button key={ex} onClick={() => { setNewExName(ex); setCustomExName(""); }}
                                            className={`text-[0.6rem] font-bold uppercase p-2 border-2 transition-all ${newExName === ex ? "bg-black text-white border-black" : "border-black/10 hover:border-black/30"}`}>
                                            {ex}
                                        </button>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-black/10">
                                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase mb-2">Or Custom Name</p>
                                    <input type="text" value={customExName} onChange={(e) => setCustomExName(e.target.value)} placeholder="CUSTOM EXERCISE..."
                                        className="w-full bg-transparent border-b-2 border-black/20 focus:border-black outline-none py-2 text-sm font-black uppercase placeholder:text-black/20" />
                                </div>
                                <button onClick={handleAddExercise} className="w-full bg-black text-white py-3 text-xs font-black tracking-[0.4em] uppercase">Add to {DAYS[selectedDay]}</button>
                            </div>
                        )}

                        <div className="bg-black border-2 border-white/20 p-6 space-y-4 min-h-[200px]">
                            {currentRoutine.exercises.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/10">
                                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-30 text-center px-8">No bodyweight routine mapped for {DAYS[selectedDay]}</p>
                                </div>
                            ) : (
                                currentRoutine.exercises.map((ex: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleExercise(i)}>
                                            <div className={`w-6 h-6 border-2 transition-all flex items-center justify-center ${ex.done ? "bg-white border-white text-black" : "border-white/20 group-hover:border-white text-transparent"}`}>
                                                ✓
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-black tracking-widest uppercase transition-all ${ex.done ? "line-through opacity-30" : "opacity-100"}`}>{ex.name}</span>
                                                <span className="text-[0.6rem] font-bold tracking-[0.2em] opacity-30">BODYWEIGHT • {ex.target}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteExercise(i)} className="text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100 px-2">✕</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Hydration */}
                <div className="space-y-12">
                    <section className="space-y-6">
                        <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                            <h2 className="text-sm tracking-[0.4em] uppercase font-black">Hydration</h2>
                            <span className="text-xs font-black tabular-nums">{waterIntake / 1000}L <span className="opacity-30">/ 2.5L</span></span>
                        </div>
                        <div className="bg-black border-4 border-white p-8 relative overflow-hidden">
                            <div className="flex flex-col gap-8 relative z-10">
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {droplets.map((_, i) => (
                                        <div key={i} onClick={() => setWaterIntake((i + 1) * 250)}
                                            className={`w-6 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center overflow-hidden
                                                ${waterIntake >= (i + 1) * 250 ? "bg-white border-white" : "border-white/20 hover:border-white/60"}`}>
                                            <div className={`w-full h-full bg-white transition-transform duration-500 origin-bottom scale-y-0 ${waterIntake >= (i + 1) * 250 ? "scale-y-100" : ""}`} />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <button onClick={() => updateWater(-250)} className="w-12 h-12 border-2 border-white/20 hover:border-white hover:bg-white hover:text-black transition-all font-black text-xl">-</button>
                                    <div className="text-center">
                                        <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-40 mb-1">Last Entry</p>
                                        <p className="text-sm font-black">+250ML</p>
                                    </div>
                                    <button onClick={() => updateWater(250)} className="w-12 h-12 border-2 border-white/20 hover:border-white hover:bg-white hover:text-black transition-all font-black text-xl">+</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Execution State */}
                    {currentRoutine.exercises.length > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <button
                                onClick={handleFinishProtocol}
                                className={`w-full py-6 flex flex-col items-center justify-center border-4 transition-all uppercase tracking-widest font-black ${currentRoutine.exercises.every((ex: any) => ex.done)
                                    ? "bg-white text-black border-white hover:bg-transparent hover:text-white"
                                    : "bg-black text-white/30 border-white/10 hover:border-white/30 cursor-not-allowed"
                                    }`}
                            >
                                <span className="text-xl">Execute Protocol</span>
                                <span className="text-[0.6rem] opacity-70 mt-2 tracking-[0.4em]">Log 45m Session to Matrix</span>
                            </button>
                        </div>
                    )}

                    {/* Consistency Graph */}
                    <div className="pt-4">
                        <ConsistencyGraph workouts={pastWorkouts || []} filterType="Bodyweight" />
                    </div>
                </div>
            </div>
        </div>
    );
}
