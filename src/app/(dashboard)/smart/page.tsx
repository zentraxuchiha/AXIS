"use client";

import { useState } from "react";

export default function SmartPage() {
    const [mode, setMode] = useState<"menu" | "notes" | "resume">("menu");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAI = async (type: "summarize" | "resume") => {
        if (!input.trim()) return;
        setLoading(true);
        setOutput("");

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input, type }),
            });
            const data = await res.json();
            if (data.result) {
                setOutput(data.result);
            } else {
                setOutput(data.error || "Failed to generate insights. Check your API configuration.");
            }
        } catch (error) {
            setOutput("Network error or system offline. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (mode !== "menu") {
        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500 relative">
                <button
                    onClick={() => { setMode("menu"); setOutput(""); setInput(""); }}
                    className="group flex items-center gap-4 bg-black text-white px-6 py-3 border-4 border-white hover:bg-white hover:text-black transition-colors font-black tracking-widest uppercase text-xs"
                >
                    <span className="group-hover:-translate-x-2 transition-transform">&larr;</span> Return
                </button>

                <header className="relative pt-8 pb-8 border-b-4 border-white">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-none">
                        {mode === "notes" ? "Summarizer" : "Resume"}
                    </h1>
                </header>

                <div className="space-y-6">
                    <div className="relative border-4 border-white p-2 bg-black">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`PASTE RAW ${mode === "notes" ? "TEXT" : "BACKGROUND"} HERE...`}
                            className="w-full h-64 bg-black p-6 font-bold text-sm tracking-wide text-white placeholder:text-white/30 focus:outline-none resize-none"
                        />
                    </div>

                    <button
                        onClick={() => handleAI(mode === "notes" ? "summarize" : "resume")}
                        className="w-full bg-white text-black text-xl font-black tracking-[0.2em] uppercase py-6 border-4 border-white hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-4"
                    >
                        {loading ? (
                            <span className="w-6 h-6 border-4 border-t-black border-r-black border-b-transparent border-l-transparent rounded-full animate-spin" />
                        ) : (
                            <><div className="w-4 h-4 bg-current transform rotate-45" /> Generate Insights</>
                        )}
                    </button>
                </div>

                {output && (
                    <div className="pt-12 animate-in slide-in-from-bottom-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-8 bg-white" />
                            <h2 className="text-white text-xl font-black tracking-[0.4em] uppercase">Output</h2>
                        </div>
                        <div className="bg-white text-black p-8 border-4 border-black shadow-[8px_8px_0px_white] font-sans text-base font-bold whitespace-pre-wrap selection:bg-black selection:text-white">
                            {output}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-16 animate-in fade-in duration-700 relative">
            {/* Header Section */}
            <header className="relative pt-12 pb-8 border-b-4 border-white">
                <div className="absolute top-0 right-12 w-32 h-32 border-8 border-white opacity-20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 border-2 border-white transform -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-10 pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none">
                        Smart
                    </h1>
                    <p className="text-white text-xs tracking-[0.4em] font-bold mt-6 uppercase bg-black inline-block pr-4">Leverage intelligence.</p>
                </div>
            </header>

            <section className="space-y-6">
                <div className="flex justify-between items-center bg-white text-black px-4 py-2 border-l-8 border-black shadow-[4px_4px_0px_white]">
                    <h2 className="text-sm tracking-[0.4em] uppercase font-black">AI Tools</h2>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 bg-black transform rotate-45" />
                        <div className="w-3 h-3 border-2 border-black transform rotate-45" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Notes Summarizer Card */}
                    <div
                        onClick={() => setMode("notes")}
                        className="bg-black border-4 border-white p-8 group cursor-pointer hover:bg-white hover:text-black transition-colors relative overflow-hidden flex flex-col justify-between aspect-square"
                    >
                        <div className="absolute -top-12 -right-12 w-32 h-32 border-4 border-white/20 group-hover:border-black/10 transition-colors pointer-events-none" />

                        <div className="flex justify-between items-start">
                            <h3 className="text-3xl font-black tracking-widest uppercase leading-tight w-2/3">Notes<br />Summarizer</h3>
                            <span className="text-4xl font-light transform -rotate-45 group-hover:rotate-0 transition-transform">&rarr;</span>
                        </div>

                        <p className="text-sm font-bold tracking-[0.3em] uppercase opacity-50 bg-white/10 group-hover:bg-black/10 inline-block px-3 py-1 self-start">Distill the noise</p>
                    </div>

                    {/* Resume Builder Card */}
                    <div
                        onClick={() => setMode("resume")}
                        className="bg-black border-4 border-white p-8 group cursor-pointer hover:bg-white hover:text-black transition-colors relative overflow-hidden flex flex-col justify-between aspect-square"
                    >
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 border-4 border-white/20 group-hover:border-black/10 rounded-full transition-colors pointer-events-none" />

                        <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-3xl font-black tracking-widest uppercase leading-tight w-2/3">Resume<br />Builder</h3>
                            <span className="text-4xl font-light transform -rotate-45 group-hover:rotate-0 transition-transform">&rarr;</span>
                        </div>

                        <p className="text-sm font-bold tracking-[0.3em] uppercase opacity-50 bg-white/10 group-hover:bg-black/10 inline-block px-3 py-1 self-start relative z-10">ATS-optimized export</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
