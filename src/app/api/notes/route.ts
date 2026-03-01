import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Note from "@/models/Note";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        const notes = await Note.find({ userId: session.user.id }).sort({ updatedAt: -1 });
        return NextResponse.json(notes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notes", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { title, content } = await req.json();
        await connectToDatabase();
        const note = await Note.create({
            userId: session.user.id,
            title: title || "Untitled Note",
            content: content || "",
        });
        return NextResponse.json(note, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create note", details: String(error) }, { status: 500 });
    }
}
