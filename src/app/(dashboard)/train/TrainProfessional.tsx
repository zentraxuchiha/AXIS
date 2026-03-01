"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import ConsistencyGraph from "@/components/ConsistencyGraph";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const bodyParts = [
    { title: "Chest", sub: "Pectoral Development" },
    { title: "Back", sub: "Lat & Trap Architecture" },
    { title: "Legs", sub: "Lower Body Foundation" },
    { title: "Arms", sub: "Bicep & Tricep Isolation" },
    { title: "Shoulders", sub: "Deltoid Caps" }
];

const mockExercises: Record<string, any[]> = {
    "Chest": [
        { name: "Barbell Bench Press", sets: "4x8-10", instructions: "Plant feet firmly. Lower bar to mid-chest. Explosive press upward. Keep scapula retracted.", imageRef: "barbell-bench-press.png" },
        { name: "Incline Dumbbell Press", sets: "3x10-12", instructions: "Focus on upper pectoral stretch. Avoid locking elbows at the top.", imageRef: "incline-dumbbell-press.png" },
        { name: "Chest Dips", sets: "3xFailure", instructions: "Lean forward to engage chest. Lower until slight stretch, then press up.", imageRef: "chest-dips.png" },
        { name: "Cable Fly", sets: "3x12-15", instructions: "Maintain slight bend in elbows. Squeeze pecs together at the peak of the movement.", imageRef: "cable-fly.png" },
        { name: "Dumbbell Pullover", sets: "3x10", instructions: "Drop hips slightly. Keep arms relatively straight to stretch the ribcage and pecs.", imageRef: "dumbbell-pullover.png" }
    ],
    "Back": [
        { name: "Deadlift", sets: "4x5", instructions: "Neutral spine. Drive through the floor with legs, then hinge hips forward.", imageRef: "deadlift.png" },
        { name: "Pull-Ups", sets: "4xFailure", instructions: "Wide grip. Pull elbows down and back. Touch upper chest to bar.", imageRef: "pull-ups.png" },
        { name: "Barbell Bent-Over Row", sets: "4x8-10", instructions: "Hinge at hips. Keep back parallel to floor. Pull bar to navel.", imageRef: "barbell-bent-over-row.png" },
        { name: "Lat Pulldown", sets: "3x10-12", instructions: "Retract scapula before pulling. Drive elbows down towards the floor.", imageRef: "lat-pulldown.png" },
        { name: "Seated Cable Row", sets: "3x12", instructions: "Keep torso stationary. Pull handle to stomach and squeeze lats.", imageRef: "seated-cable-row.png" }
    ],
    "Legs": [
        { name: "Barbell Back Squat", sets: "4x8", instructions: "Brace core. Break at hips and knees simultaneously. Drive up through mid-foot.", imageRef: "barbell-back-squat.png" },
        { name: "Romanian Deadlift", sets: "4x10", instructions: "Soft knees. Push hips back as far as possible to stretch hamstrings.", imageRef: "romanian-deadlift.png" },
        { name: "Leg Press", sets: "3x12-15", instructions: "Control the descent. Do not lock out knees at the top of the movement.", imageRef: "leg-press.png" },
        { name: "Walking Lunges", sets: "3x12/leg", instructions: "Keep torso upright. Drop trailing knee close to the floor.", imageRef: "walking-lunges.png" },
        { name: "Standing Calf Raises", sets: "4x15-20", instructions: "Full stretch at the bottom. Hold the peak contraction for 1 second.", imageRef: "standing-calf-raises.png" }
    ],
    "Arms": [
        { name: "Barbell Bicep Curl", sets: "4x10", instructions: "Keep elbows pinned to sides. Squeeze biceps at the top. Control the negative.", imageRef: "barbell-bicep-curl.png" },
        { name: "Hammer Curl", sets: "3x10-12", instructions: "Neutral grip. Focus on the brachialis and forearm tie-in.", imageRef: "hammer-curl.png" },
        { name: "Skull Crushers", sets: "4x10", instructions: "Keep elbows pointed to ceiling. Lower bar to forehead, extend triceps to finish.", imageRef: "skull-crushers.png" },
        { name: "Cable Tricep Pushdown", sets: "3x12-15", instructions: "Use rope or V-bar. Keep shoulders down and isolate the triceps.", imageRef: "cable-tricep-pushdown.png" },
        { name: "Close-Grip Bench Press", sets: "3x8-10", instructions: "Hands shoulder-width apart. Keep elbows tucked to maximize tricep load.", imageRef: "close-grip-bench-press.png" }
    ],
    "Shoulders": [
        { name: "Overhead Barbell Press", sets: "4x8", instructions: "Brace glutes and core. Press bar in a straight line overhead.", imageRef: "overhead-barbell-press.png" },
        { name: "Dumbbell Lateral Raise", sets: "4x12-15", instructions: "Slight lean forward. Raise dumbbells outward, leading with the elbows.", imageRef: "dumbbell-lateral-raise.png" },
        { name: "Front Raise", sets: "3x12", instructions: "Control the weight. Raise to weight-lifting height to isolate the anterior deltoid.", imageRef: "front-raise.png" },
        { name: "Rear Delt Fly", sets: "3x15", instructions: "Hinge over. Focus on pulling the shoulder blades apart, not together.", imageRef: "rear-delt-fly.png" },
        { name: "Upright Row", sets: "3x10-12", instructions: "Wide grip to target lateral delts. Pull elbows higher than hands.", imageRef: "upright-row.png" }
    ]
};

export default function TrainProfessional() {
    const { data: allRoutines, mutate: mutateRoutines } = useSWR("/api/workout-routines", fetcher);
    const { data: pastWorkouts, mutate: mutateWorkouts } = useSWR("/api/workouts", fetcher);

    const [selectedDay, setSelectedDay] = useState(() => {
        const d = new Date().getDay();
        return d === 0 ? 6 : d - 1; // Mon=0, Sun=6
    });

    const [selectedPart, setSelectedPart] = useState<string | null>(null);

    // --- Hydration State (Professional Edition) ---
    const [waterIntake, setWaterIntake] = useState(0); // in ml

    // --- BMI State (Professional Edition) ---
    const [height, setHeight] = useState<string>(""); // cm
    const [weight, setWeight] = useState<string>(""); // kg

    // --- Persistence & Daily Reset ---
    useEffect(() => {
        const today = new Date().toDateString();

        // Hydration Init
        const savedHydration = localStorage.getItem("axis_prof_hydration");
        if (savedHydration) {
            const parsed = JSON.parse(savedHydration);
            if (parsed.date === today) {
                setWaterIntake(parsed.amount);
            } else {
                setWaterIntake(0);
            }
        }

        // BMI Init
        const savedBMI = localStorage.getItem("axis_prof_bmi");
        if (savedBMI) {
            const parsed = JSON.parse(savedBMI);
            setHeight(parsed.height || "");
            setWeight(parsed.weight || "");
        }
    }, []);

    useEffect(() => {
        const today = new Date().toDateString();
        localStorage.setItem("axis_prof_hydration", JSON.stringify({ date: today, amount: waterIntake }));
    }, [waterIntake]);

    useEffect(() => {
        localStorage.setItem("axis_prof_bmi", JSON.stringify({ height, weight }));
    }, [height, weight]);

    // Current Routine for Selected Day
    const currentRoutine = useMemo(() => {
        return allRoutines?.find((r: any) => r.dayOfWeek === selectedDay) || { exercises: [] };
    }, [allRoutines, selectedDay]);

    // --- Handlers ---
    const updateWater = (delta: number) => {
        setWaterIntake(prev => Math.max(0, Math.min(prev + delta, 5000)));
    };

    const addToRoutine = async (ex: any) => {
        const updatedExercises = [
            ...currentRoutine.exercises,
            { name: ex.name, type: 'gym', target: ex.sets, done: false }
        ];

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
        mutateRoutines();
    };

    const toggleExercise = async (index: number) => {
        const updatedExercises = currentRoutine.exercises.map((ex: any, i: number) =>
            i === index ? { ...ex, done: !ex.done } : ex
        );

        mutateRoutines(allRoutines?.map((r: any) => r.dayOfWeek === selectedDay ? { ...r, exercises: updatedExercises } : r), false);

        await fetch("/api/workout-routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dayOfWeek: selectedDay, exercises: updatedExercises }),
        });
        mutateRoutines();
    };

    const deleteExercise = async (index: number) => {
        const updatedExercises = currentRoutine.exercises.filter((_: any, i: number) => i !== index);

        mutateRoutines(allRoutines?.map((r: any) => r.dayOfWeek === selectedDay ? { ...r, exercises: updatedExercises } : r), false);

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

        // Standard professional protocol assumed at 90m
        await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "Gym", durationMinutes: 90 }),
        });

        // Uncheck all routines for the next cycle
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

    const droplets = Array.from({ length: 12 }); // 12 x 250ml = 3L goal for pros

    // BMI Calculation (Professional Logic)
    const h = parseFloat(height);
    const w = parseFloat(weight);
    let bmi = 0;
    let bmiCategory = "PENDING";
    let bmiSuggestion = "INPUT BIOMETRIC DATA FOR ARCHITECTURAL FEEDBACK.";

    if (h > 0 && w > 0) {
        bmi = parseFloat((w / ((h / 100) * (h / 100))).toFixed(1));
        if (bmi < 18.5) {
            bmiCategory = "UNDERESTIMATED";
            bmiSuggestion = "Inadequate mass detected. Execute a high-density hyper-caloric protocol. Focus on heavy-load progressive overload.";
        } else if (bmi >= 18.5 && bmi < 24.9) {
            bmiCategory = "OPTIMIZED";
            bmiSuggestion = "Biometric homeostasis confirmed. Maintain high-intensity metabolic load. Focus on aesthetic refinement.";
        } else if (bmi >= 25 && bmi < 29.9) {
            bmiCategory = "EXCESS MASS";
            bmiSuggestion = "Non-lean mass detected. Initiate recursive metabolic conditioning. Execute an aggressive micro-deficit.";
        } else {
            bmiCategory = "CRITICAL MASS";
            bmiSuggestion = "Structural integrity at risk. Prioritize cardiovascular endurance and systemic metabolic flux.";
        }
    }

    return (
        <div className="space-y-16 animate-in fade-in duration-700 relative">
            <header className="relative pt-12 pb-8 border-b-4 border-white">
                <div className="absolute top-0 right-12 w-32 h-32 border-4 border-white rounded-full opacity-20 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none">Gym</h1>
                    <p className="text-white text-xs tracking-[0.4em] font-bold mt-6 uppercase bg-black inline-block pr-4">Advanced Split</p>
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

            <div className="space-y-12">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8">
                    {/* Left: BMI Intelligence */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                            <h2 className="text-sm tracking-[0.4em] uppercase font-black">Biometric Intelligence</h2>
                            <div className="w-4 h-4 border-2 border-black" />
                        </div>
                        <div className="bg-black border-4 border-white p-6 relative">
                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold tracking-[0.3em] uppercase opacity-50 text-white">Vertical (CM)</label>
                                        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="180"
                                            className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-xl font-black tabular-nums text-white placeholder:text-white/20 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold tracking-[0.3em] uppercase opacity-50 text-white">Mass (KG)</label>
                                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="85"
                                            className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-xl font-black tabular-nums text-white placeholder:text-white/20 transition-colors" />
                                    </div>
                                </div>
                                <div className="border-t border-white/20 pt-6 flex items-end justify-between">
                                    <div>
                                        <p className="text-[0.6rem] font-bold tracking-[0.3em] uppercase opacity-50 mb-1 text-white">Index</p>
                                        <div className="text-5xl font-black tracking-tighter tabular-nums leading-none text-white">{bmi > 0 ? bmi : "--"}</div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[0.6rem] font-bold tracking-[0.3em] uppercase opacity-50 mb-1 text-white">Status</p>
                                        <div className={`text-sm font-black tracking-widest uppercase px-3 py-1 border-2 ${bmi > 0 ? 'bg-white text-black border-white' : 'border-white/30 text-white/50'}`}>{bmiCategory}</div>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 mt-2">
                                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase text-white/40 mb-2">Architectural Directive</p>
                                    <p className="text-xs leading-relaxed font-bold tracking-wider text-white/80 italic">"{bmiSuggestion}"</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right: Hydration */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                            <h2 className="text-sm tracking-[0.4em] uppercase font-black">Hydration Architecture</h2>
                            <span className="text-xs font-black tabular-nums">{waterIntake / 1000}L <span className="opacity-30">/ 3.0L</span></span>
                        </div>
                        <div className="bg-black border-4 border-white p-8 relative overflow-hidden group">
                            <div className="flex flex-col gap-8 relative z-10">
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {droplets.map((_, i) => (
                                        <div key={i} onClick={() => setWaterIntake((i + 1) * 250)}
                                            className={`w-6 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center overflow-hidden
                                                ${waterIntake >= (i + 1) * 250 ? "bg-white border-white" : "border-white/10 hover:border-white/40"}`}>
                                            <div className={`w-full h-full bg-white transition-transform duration-500 origin-bottom scale-y-0 ${waterIntake >= (i + 1) * 250 ? "scale-y-100" : ""}`} />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center max-w-sm mx-auto w-full">
                                    <button onClick={() => updateWater(-250)} className="w-14 h-14 border-2 border-white/10 hover:border-white hover:bg-white hover:text-black transition-all font-black text-xl">-</button>
                                    <div className="text-center group-hover:scale-110 transition-transform">
                                        <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-40 mb-1">Session</p>
                                        <p className="text-base font-black text-white">+250ML</p>
                                    </div>
                                    <button onClick={() => updateWater(250)} className="w-14 h-14 border-2 border-white/10 hover:border-white hover:bg-white hover:text-black transition-all font-black text-xl">+</button>
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
                                <span className="text-[0.6rem] opacity-70 mt-2 tracking-[0.4em]">Log 90m Session to Matrix</span>
                            </button>
                        </div>
                    )}

                    {/* Consistency Graph */}
                    <div className="pt-4">
                        <ConsistencyGraph workouts={pastWorkouts || []} filterType="Gym" />
                    </div>
                </div>

                {/* TODAY PROTOCOL (Selected Day's Routine) */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                        <h2 className="text-sm tracking-[0.4em] uppercase font-black">{DAYS[selectedDay]} Protocol</h2>
                    </div>
                    <div className="bg-black border-2 border-white/20 p-6 space-y-4 min-h-[150px]">
                        {currentRoutine.exercises.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10">
                                <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase opacity-30">No gym routine mapped. Select exercises below.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {currentRoutine.exercises.map((ex: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between border border-white/20 p-4 group">
                                        <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleExercise(i)}>
                                            <div className={`w-6 h-6 border-2 transition-all flex items-center justify-center ${ex.done ? "bg-white border-white text-black" : "border-white/20 group-hover:border-white text-transparent"}`}>✓</div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-black tracking-widest uppercase transition-all ${ex.done ? "line-through opacity-30" : "opacity-100"}`}>{ex.name}</span>
                                                <span className="text-[0.6rem] font-bold tracking-[0.2em] opacity-30">GYM • {ex.target}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteExercise(i)} className="text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ARCHIVE (Exercise Catalog) */}
                <section className="space-y-8">
                    <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                        <h2 className="text-sm tracking-[0.4em] uppercase font-black">Exercise archive</h2>
                    </div>

                    {!selectedPart ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bodyParts.map((part) => (
                                <button key={part.title} onClick={() => setSelectedPart(part.title)}
                                    className="group relative border-2 border-white/20 bg-black/50 p-6 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 hover:border-white hover:bg-white hover:text-black cursor-pointer aspect-video">
                                    <h2 className="text-2xl font-black tracking-widest uppercase mb-2 relative z-10">{part.title}</h2>
                                    <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 relative z-10">{part.sub}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
                            <button onClick={() => setSelectedPart(null)} className="text-xs font-bold tracking-[0.3em] uppercase opacity-60 hover:opacity-100 border-b border-white pb-1 transition-all">← Back to Categories</button>
                            <h2 className="text-3xl font-black tracking-widest uppercase border-l-8 border-white pl-4 ">{selectedPart} Library</h2>
                            <div className="space-y-6">
                                {mockExercises[selectedPart]?.map((ex, i) => (
                                    <div key={i} className="bg-white/5 border-2 border-white/20 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group hover:border-white/40">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black tracking-widest uppercase mb-2">{ex.name}</h3>
                                            <p className="text-xs tracking-widest uppercase opacity-70 mb-4">{ex.instructions}</p>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white text-black text-[0.6rem] font-black tracking-[0.2em] py-1 px-4 uppercase">{ex.sets}</div>
                                                <button onClick={() => addToRoutine(ex)} className="bg-black text-white border border-white/20 hover:bg-white hover:text-black text-[0.6rem] font-black tracking-[0.2em] py-1 px-4 uppercase transition-all">+ Add to {DAYS[selectedDay]}</button>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-48 lg:w-64 aspect-square relative overflow-hidden border-2 border-white/20 group-hover:border-white transition-colors duration-300">
                                            <Image src={`/exercises/${ex.imageRef}`} alt={ex.name} fill sizes="256px" className="object-cover grayscale brightness-110 contrast-125" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
