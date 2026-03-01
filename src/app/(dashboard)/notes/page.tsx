"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { NotesEditor } from "@/components/NotesEditor";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NotesPage() {
    const { data: notes, error } = useSWR("/api/notes", fetcher);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [localTitle, setLocalTitle] = useState("");
    const [localContent, setLocalContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (selectedNote) {
            setLocalTitle(selectedNote.title);
            setLocalContent(selectedNote.content);
        } else {
            setLocalTitle("");
            setLocalContent("");
        }
    }, [selectedNote]);

    const handleCreateNote = async () => {
        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "New Note", content: "" }),
            });
            const newNote = await res.json();
            mutate("/api/notes");
            setSelectedNote(newNote);
        } catch (err) {
            console.error("Failed to create note", err);
        }
    };

    const handleSave = async () => {
        if (!selectedNote) return;
        setIsSaving(true);
        try {
            await fetch(`/api/notes/${selectedNote._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: localTitle, content: localContent }),
            });
            mutate("/api/notes");
        } catch (err) {
            console.error("Failed to save note", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this note?")) return;
        try {
            await fetch(`/api/notes/${id}`, { method: "DELETE" });
            if (selectedNote?._id === id) {
                setSelectedNote(null);
            }
            mutate("/api/notes");
        } catch (err) {
            console.error("Failed to delete note", err);
        }
    };

    if (error) return <div className="p-8 text-white">Failed to load notes</div>;

    return (
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Sidebar: Note List */}
            <div className="w-full md:w-80 border-r-2 border-white/10 flex flex-col bg-black overflow-y-auto">
                <div className="p-6 border-b-2 border-white/10 flex justify-between items-center bg-black/50 sticky top-0 z-10 backdrop-blur-md">
                    <h2 className="text-xl font-black tracking-widest uppercase">My Notes</h2>
                    <button
                        onClick={handleCreateNote}
                        className="w-10 h-10 border-2 border-white flex items-center justify-center text-xl font-bold hover:bg-white hover:text-black transition-all"
                    >
                        +
                    </button>
                </div>

                <div className="flex-1">
                    {!notes || notes.length === 0 ? (
                        <div className="p-8 text-white/30 text-xs font-bold uppercase tracking-widest text-center mt-10">
                            No notes found.<br />Click + to start.
                        </div>
                    ) : (
                        notes.map((note: any) => (
                            <div
                                key={note._id}
                                onClick={() => setSelectedNote(note)}
                                className={`p-6 border-b border-white/5 cursor-pointer transition-all group relative overflow-hidden
                                    ${selectedNote?._id === note._id ? "bg-white text-black" : "hover:bg-white/5"}
                                `}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-black tracking-wider uppercase truncate mb-1 ${selectedNote?._id === note._id ? "text-black" : "text-white"}`}>
                                            {note.title || "Untitled Note"}
                                        </h3>
                                        <p className={`text-[0.6rem] font-bold tracking-widest uppercase ${selectedNote?._id === note._id ? "text-black/50" : "text-white/30"}`}>
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(note._id, e)}
                                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500
                                            ${selectedNote?._id === note._id ? "text-black" : "text-white"}
                                        `}
                                    >
                                        ✕
                                    </button>
                                </div>
                                {selectedNote?._id === note._id && (
                                    <div className="absolute top-0 right-0 w-2 h-full bg-black/10" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content: Editor */}
            <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
                {selectedNote ? (
                    <>
                        <div className="p-8 border-b-2 border-white/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className={`text-[0.6rem] font-black tracking-[0.5em] uppercase px-3 py-1 border-2 ${isSaving ? "border-white animate-pulse" : "border-white/20 text-white/30"}`}>
                                    {isSaving ? "Saving..." : "Editor"}
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleSave}
                                        className="text-[0.6rem] font-black tracking-[0.3em] uppercase px-6 py-2 border-2 border-white hover:bg-white hover:text-black transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                            <input
                                value={localTitle}
                                onChange={(e) => setLocalTitle(e.target.value)}
                                onBlur={handleSave}
                                placeholder="Note Title..."
                                className="w-full bg-transparent text-4xl font-black uppercase tracking-tight focus:outline-none border-b-2 border-transparent focus:border-white transition-all pb-2"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <NotesEditor
                                content={localContent}
                                onChange={(content) => setLocalContent(content)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-24 h-24 border-4 border-white/5 flex items-center justify-center mb-8 rotate-45">
                            <span className="text-4xl font-black text-white/10 -rotate-45">?</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-[0.3em] uppercase text-white/10 mb-2">Select a Note</h2>
                        <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-white/10">Choose a note from the left sidebar to start editing</p>
                    </div>
                )}
            </div>
        </div>
    );
}
