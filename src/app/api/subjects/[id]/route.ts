import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Subject from "@/models/Subject";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        await connectToDatabase();
        const subject = await Subject.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { $set: body },
            { new: true }
        );
        if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(subject);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update subject", details: String(error) }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        await Subject.findOneAndDelete({ _id: id, userId: session.user.id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete subject", details: String(error) }, { status: 500 });
    }
}
