import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Note from "@/models/Note";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const { title, content } = await req.json();

        await connectToDatabase();
        const note = await Note.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { title, content },
            { new: true }
        );

        if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
        return NextResponse.json(note);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update note", details: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await connectToDatabase();
        const note = await Note.findOneAndDelete({ _id: id, userId: session.user.id });

        if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
        return NextResponse.json({ message: "Note deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete note", details: String(error) }, { status: 500 });
    }
}
