"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SubjectProgressPage() {
    const { data: subjects, mutate } = useSWR("/api/subjects", fetcher);

    // ── Add Subject form state ──
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [chapterInput, setChapterInput] = useState("");
    const [chapterList, setChapterList] = useState<string[]>([]);

    // ── Per-subject: which one is expanded ──
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // ── Per-subject: new chapter input ──
    const [addChapterFor, setAddChapterFor] = useState<string | null>(null);
    const [newChapterName, setNewChapterName] = useState("");

    const activeSubjects = (subjects || []).filter((s: any) => {
        const chs: any[] = s.chapters ?? [];
        return chs.length === 0 || chs.some((c: any) => !c.isCompleted);
    });
    const doneSubjects = (subjects || []).filter((s: any) => {
        const chs: any[] = s.chapters ?? [];
        return chs.length > 0 && chs.every((c: any) => c.isCompleted);
    });

    const avgPct = subjects?.length
        ? Math.round(subjects.reduce((sum: number, s: any) => {
            const total = s.chapters?.length || 0;
            const done = s.chapters?.filter((c: any) => c.isCompleted).length || 0;
            return sum + (total > 0 ? Math.round((done / total) * 100) : 0);
        }, 0) / subjects.length)
        : 0;

    // ─── Add chapter to staging list ───
    const addToChapterList = () => {
        const trimmed = chapterInput.trim();
        if (trimmed && !chapterList.includes(trimmed)) {
            setChapterList([...chapterList, trimmed]);
        }
        setChapterInput("");
    };

    const removeFromChapterList = (ch: string) => {
        setChapterList(chapterList.filter((c) => c !== ch));
    };

    // ─── Create subject ───
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await fetch("/api/subjects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim(), chapters: chapterList }),
        });
        setName(""); setChapterList([]); setChapterInput(""); setIsAdding(false);
        mutate();
    };

    // ─── Toggle chapter completion ───
    const toggleChapter = async (subject: any, chapterId: string, current: boolean) => {
        const updated = subject.chapters.map((c: any) =>
            c._id === chapterId ? { ...c, isCompleted: !current } : c
        );
        mutate(
            (all: any[]) => all?.map((s: any) => s._id === subject._id ? { ...s, chapters: updated } : s),
            { revalidate: false }
        );
        await fetch(`/api/subjects/${subject._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chapters: updated }),
        });
        mutate();
    };

    // ─── Add chapter to existing subject ───
    const addChapterToSubject = async (subject: any) => {
        const trimmed = newChapterName.trim();
        if (!trimmed) return;
        const updated = [...subject.chapters, { name: trimmed, isCompleted: false }];
        await fetch(`/api/subjects/${subject._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chapters: updated }),
        });
        setNewChapterName(""); setAddChapterFor(null);
        mutate();
    };

    // ─── Delete individual chapter ───
    const deleteChapter = async (subject: any, chapterId: string) => {
        const updated = subject.chapters.filter((c: any) => c._id !== chapterId);
        await fetch(`/api/subjects/${subject._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chapters: updated }),
        });
        mutate();
    };

    // ─── Delete subject ───
    const handleDelete = async (id: string) => {
        if (!confirm("DELETE THIS SUBJECT?")) return;
        mutate(subjects?.filter((s: any) => s._id !== id), false);
        await fetch(`/api/subjects/${id}`, { method: "DELETE" });
        mutate();
    };

    const renderCard = (s: any) => {
        const total = s.chapters?.length || 0;
        const done = s.chapters?.filter((c: any) => c.isCompleted).length || 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const isExpanded = expandedId === s._id;

        return (
            <div key={s._id} className={`border-2 transition-all duration-300 ${pct === 100 && total > 0 ? "border-white/10 opacity-50" : "border-white/20 hover:border-white/60"}`}>
                {/* Subject Header */}
                <div
                    className="flex items-center justify-between gap-4 p-5 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : s._id)}
                >
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-black tracking-widest uppercase text-2xl ${pct === 100 && total > 0 ? "line-through opacity-50" : ""}`}>
                            {s.name}
                        </h3>
                        <p className="text-[0.55rem] font-bold tracking-[0.25em] uppercase opacity-40 mt-1">
                            {done}/{total} CHAPTERS · {pct}% COMPLETE
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-black tabular-nums">
                            {pct}<span className="text-sm opacity-30">%</span>
                        </span>
                        <span className="text-white/30 text-xs font-black">{isExpanded ? "▲" : "▼"}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }}
                            className="text-white/30 hover:text-white transition-colors text-xs font-black tracking-widest hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)] ml-1"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-0.5 bg-white/10">
                    <div className="h-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>

                {/* Chapters (expanded) */}
                {isExpanded && (
                    <div className="px-5 pb-5 pt-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-[0.5rem] font-black tracking-[0.3em] uppercase opacity-30 mb-3">Sub-chapters</p>

                        {s.chapters?.length === 0 && (
                            <p className="text-white/20 text-[0.6rem] font-bold tracking-widest uppercase">No chapters yet.</p>
                        )}

                        {s.chapters?.map((ch: any) => (
                            <div key={ch._id} className="flex items-center gap-3 group py-1">
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleChapter(s, ch._id, ch.isCompleted)}
                                    className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all
                                        ${ch.isCompleted ? "bg-white border-white" : "border-white/30 hover:border-white"}`}
                                >
                                    {ch.isCompleted && (
                                        <span className="text-black text-[0.5rem] font-black">✓</span>
                                    )}
                                </button>

                                {/* Chapter name */}
                                <span className={`flex-1 text-xs font-bold tracking-widest uppercase transition-all
                                    ${ch.isCompleted ? "line-through opacity-30" : "opacity-80"}`}>
                                    {ch.name}
                                </span>

                                {/* Delete chapter */}
                                <button
                                    onClick={() => deleteChapter(s, ch._id)}
                                    className="text-white/20 hover:text-white transition-colors text-xs opacity-0 group-hover:opacity-100 hover:[text-shadow:0_0_8px_rgba(255,255,255,0.6)]"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        {/* Add chapter inline */}
                        {addChapterFor === s._id ? (
                            <div className="flex gap-2 mt-3">
                                <input
                                    autoFocus
                                    type="text"
                                    value={newChapterName}
                                    onChange={(e) => setNewChapterName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") { e.preventDefault(); addChapterToSubject(s); }
                                        if (e.key === "Escape") { setAddChapterFor(null); setNewChapterName(""); }
                                    }}
                                    placeholder="CHAPTER NAME..."
                                    className="flex-1 bg-transparent border-b border-white/30 focus:border-white outline-none text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/20 py-1"
                                />
                                <button
                                    onClick={() => addChapterToSubject(s)}
                                    className="text-[0.55rem] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                                >
                                    ADD
                                </button>
                                <button
                                    onClick={() => { setAddChapterFor(null); setNewChapterName(""); }}
                                    className="text-[0.55rem] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAddChapterFor(s._id)}
                                className="mt-3 text-[0.55rem] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors border border-white/10 hover:border-white/40 px-3 py-1.5"
                            >
                                + ADD CHAPTER
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="pt-10 pb-6 border-b-4 border-white flex items-end justify-between">
                <div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase text-white leading-none">Subjects</h1>
                    <p className="text-xs tracking-[0.4em] font-bold mt-4 uppercase opacity-60">Chapter Progress Registry</p>
                </div>
                {subjects?.length > 0 && (
                    <div className="text-right">
                        <div className="text-5xl font-black text-white">{avgPct}<span className="text-2xl opacity-40">%</span></div>
                        <p className="text-[0.6rem] tracking-[0.3em] uppercase font-bold opacity-50 mt-1">AVG COMPLETE</p>
                    </div>
                )}
            </header>

            {/* Add Subject */}
            {!isAdding ? (
                <button onClick={() => setIsAdding(true)} className="border-2 border-white/20 hover:border-white text-xs font-black tracking-[0.3em] uppercase px-6 py-3 transition-all hover:bg-white hover:text-black">
                    + ADD SUBJECT
                </button>
            ) : (
                <form onSubmit={handleCreate} className="border-2 border-white p-6 space-y-5">
                    <input
                        autoFocus type="text" value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="SUBJECT NAME..."
                        className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none py-2 text-sm font-bold uppercase tracking-widest text-white placeholder:text-white/30"
                    />

                    {/* Chapter staging list */}
                    <div className="space-y-2">
                        <p className="text-[0.5rem] font-black tracking-[0.3em] uppercase opacity-50">CHAPTERS (optional)</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={chapterInput}
                                onChange={(e) => setChapterInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToChapterList(); } }}
                                placeholder="CHAPTER NAME — PRESS ENTER TO ADD"
                                className="flex-1 bg-transparent border-b border-white/20 focus:border-white outline-none py-1 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/20"
                            />
                            <button type="button" onClick={addToChapterList}
                                className="text-[0.55rem] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors border border-white/20 hover:border-white px-3">
                                ADD
                            </button>
                        </div>
                        {chapterList.length > 0 && (
                            <ul className="space-y-1 mt-2">
                                {chapterList.map((ch, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                                        <span className="flex-1 text-xs font-bold uppercase tracking-widest opacity-70">{ch}</span>
                                        <button type="button" onClick={() => removeFromChapterList(ch)}
                                            className="text-white/30 hover:text-white text-xs transition-colors">✕</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" className="bg-white text-black text-xs font-black tracking-[0.3em] uppercase px-6 py-2">CREATE</button>
                        <button type="button" onClick={() => { setIsAdding(false); setChapterList([]); setChapterInput(""); }}
                            className="text-xs font-black uppercase opacity-40 hover:opacity-100">CANCEL</button>
                    </div>
                </form>
            )}

            {/* Active Subjects */}
            {activeSubjects.length > 0 && (
                <div className="space-y-4">{activeSubjects.map((s: any) => renderCard(s))}</div>
            )}

            {/* Done Subjects */}
            {doneSubjects.length > 0 && (
                <div className="space-y-4">
                    <p className="text-[0.6rem] font-black tracking-[0.4em] uppercase border-b border-white/10 pb-2 opacity-30">COMPLETED</p>
                    {doneSubjects.map((s: any) => renderCard(s))}
                </div>
            )}

            {(!subjects || subjects.length === 0) && (
                <div className="border-2 border-dashed border-white/10 p-16 text-center">
                    <p className="text-xs font-black tracking-[0.4em] uppercase opacity-30">NO SUBJECTS ADDED</p>
                </div>
            )}
        </div>
    );
}
