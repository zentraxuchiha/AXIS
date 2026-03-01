import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Subject from "@/models/Subject";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        const subjects = await Subject.find({ userId: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json(subjects);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch subjects", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { name, chapters } = await req.json();
        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
        await connectToDatabase();
        const subject = await Subject.create({
            userId: session.user.id,
            name: name.trim(),
            chapters: (chapters || []).map((c: string) => ({ name: c, isCompleted: false })),
        });
        return NextResponse.json(subject, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create subject", details: String(error) }, { status: 500 });
    }
}
