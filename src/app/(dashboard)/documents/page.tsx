"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const MAX_KB = 800;
const MAX_BYTES = MAX_KB * 1024;

function FileIcon({ type }: { type: string }) {
    let label = "FILE";
    if (type === "application/pdf") label = "PDF";
    else if (type.startsWith("image/")) label = "IMG";
    else if (type.includes("word") || type.includes("docx")) label = "DOC";
    return (
        <span className="inline-flex items-center justify-center w-10 h-10 border border-white/20 text-white/50 text-[0.55rem] font-black tracking-widest flex-shrink-0">
            {label}
        </span>
    );
}

function formatBytes(b: number) {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
    const { data: docs, mutate, isLoading } = useSWR("/api/documents", fetcher);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        setError("");

        // Client-side 800KB guard
        if (file.size > MAX_BYTES) {
            setError(`File too large — max ${MAX_KB} KB. Yours is ${(file.size / 1024).toFixed(0)} KB.`);
            return;
        }

        setUploading(true);
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/documents", { method: "POST", body: form });
        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Upload failed.");
        } else {
            mutate();
        }
        setUploading(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`DELETE "${name}"? This cannot be undone.`)) return;
        await fetch(`/api/documents/${id}`, { method: "DELETE" });
        mutate();
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <header className="relative pt-12 pb-8 border-b border-white/20">
                <h1 className="text-7xl md:text-8xl font-black tracking-tight uppercase bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    Documents
                </h1>
                <p className="mt-4 text-white/40 text-xs tracking-widest uppercase">
                    Secure Document Vault · max {MAX_KB} KB per file
                </p>
            </header>

            {/* Upload Zone */}
            <section
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all select-none
                    ${dragOver ? "border-white bg-white/5" : "border-white/20 hover:border-white/60 hover:bg-white/[0.02]"}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileInput}
                />
                {uploading ? (
                    <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <p className="text-white/60 text-xs tracking-widest uppercase font-bold">
                            Uploading to secure vault…
                        </p>
                    </>
                ) : (
                    <>
                        <span className="text-4xl opacity-40">↑</span>
                        <p className="text-white/60 text-xs tracking-widest uppercase font-bold text-center">
                            Drop file here or click to browse
                        </p>
                        <p className="text-white/20 text-[0.6rem] uppercase tracking-widest">
                            PDF · DOC · DOCX · PNG · JPG — max {MAX_KB} KB
                        </p>
                    </>
                )}
            </section>

            {/* Error Banner */}
            {error && (
                <div className="border border-red-500/50 bg-red-500/10 px-6 py-4 text-red-400 text-xs font-bold tracking-widest uppercase animate-in slide-in-from-top-2">
                    ⚠ {error}
                </div>
            )}

            {/* Document List */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white/40 text-[0.6rem] font-black uppercase tracking-[0.3em]">
                        Your Files
                    </h2>
                    <span className="text-white/20 text-[0.5rem] font-black uppercase tracking-[0.2em]">
                        {(docs || []).length} FILE{(docs || []).length !== 1 ? "S" : ""}
                    </span>
                </div>

                {isLoading ? (
                    <div className="text-white/30 text-xs tracking-widest uppercase animate-pulse py-10">
                        Loading vault…
                    </div>
                ) : (docs || []).length === 0 ? (
                    <div className="border border-white/10 p-12 flex flex-col items-center gap-3">
                        <span className="text-4xl opacity-20">🗄️</span>
                        <p className="text-white/30 text-xs tracking-widest uppercase text-center">
                            Vault is empty. Upload your first document.
                        </p>
                    </div>
                ) : (
                    <ul className="border border-white/10 divide-y divide-white/10">
                        {(docs || []).map((doc: any) => (
                            <li
                                key={doc._id}
                                className="flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition group"
                            >
                                <FileIcon type={doc.fileType} />
                                <div className="flex-1 min-w-0">
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white font-black text-xs uppercase tracking-widest hover:underline truncate block group-hover:tracking-[0.2em] transition-all"
                                        title={doc.name}
                                    >
                                        {doc.name}
                                    </a>
                                    <div className="flex gap-3 mt-1">
                                        <span className="text-white/30 text-[0.55rem] font-bold uppercase tracking-widest">
                                            {formatBytes(doc.sizeBytes)}
                                        </span>
                                        <span className="text-white/20 text-[0.55rem] font-bold uppercase tracking-widest">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Open link */}
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/30 hover:text-white transition-colors text-xs font-black tracking-widest uppercase"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    OPEN
                                </a>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(doc._id, doc.name)}
                                    className="text-white/30 hover:text-white transition-colors text-xs font-black tracking-widest uppercase hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]"
                                    title="Delete"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
