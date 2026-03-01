import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import FocusSession from "@/models/FocusSession";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        const sessions = await FocusSession.find({ userId: session.user.id }).sort({ date: -1 }).limit(20);
        return NextResponse.json(sessions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sessions", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { label, durationMinutes } = await req.json();
        if (!durationMinutes) return NextResponse.json({ error: "Duration is required" }, { status: 400 });
        await connectToDatabase();
        const focusSession = await FocusSession.create({
            userId: session.user.id,
            label: label || "Deep Work",
            durationMinutes,
        });
        return NextResponse.json(focusSession, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log session", details: String(error) }, { status: 500 });
    }
}
