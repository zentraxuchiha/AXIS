"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect } from "react";

interface NotesEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const colors = [
        { name: "White", value: "#ffffff" },
        { name: "Gray", value: "#8A8A8A" },
        { name: "Red", value: "#ff4444" },
        { name: "Green", value: "#44ff44" },
        { name: "Blue", value: "#4444ff" },
        { name: "Yellow", value: "#ffff44" },
    ];

    return (
        <div className="flex flex-wrap gap-2 p-4 border-b-2 border-white/10 bg-black/50 sticky top-0 z-10 backdrop-blur-md">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-3 py-1 text-[0.65rem] font-black uppercase tracking-widest border-2 transition-all ${editor.isActive("bold") ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white"}`}
            >
                Bold
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-3 py-1 text-[0.65rem] font-black uppercase tracking-widest border-2 transition-all ${editor.isActive("italic") ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white"}`}
            >
                Italic
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`px-3 py-1 text-[0.65rem] font-black uppercase tracking-widest border-2 transition-all ${editor.isActive("underline") ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white"}`}
            >
                Underline
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <div className="flex gap-1 items-center">
                {colors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => editor.chain().focus().setColor(color.value).run()}
                        className={`w-6 h-6 border transition-all ${editor.isActive("textStyle", { color: color.value }) ? "ring-2 ring-white scale-110" : "hover:scale-110"}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    );
};

export function NotesEditor({ content, onChange }: NotesEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
        ],
        immediatelyRender: false,
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none focus:outline-none min-h-[500px] p-6 text-sm text-white/80 leading-relaxed [&_h1]:text-2xl [&_h1]:font-black [&_h1]:uppercase [&_h1]:tracking-tighter [&_h1]:mb-4 [&_p]:mb-4",
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="w-full border-2 border-white/10 bg-black min-h-[600px] flex flex-col group hover:border-white/20 transition-colors">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="flex-1 overflow-y-auto cursor-text select-text" />
        </div>
    );
}
