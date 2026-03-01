import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import StudySession from "@/models/StudySession";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sessions = await StudySession.find({ userId: session.user.id, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 });
        return NextResponse.json(sessions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch study sessions", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { subject, durationMinutes, notes } = await req.json();
        if (!subject || !durationMinutes) return NextResponse.json({ error: "Subject and duration required" }, { status: 400 });
        await connectToDatabase();
        const studySession = await StudySession.create({ userId: session.user.id, subject, durationMinutes, notes });
        return NextResponse.json(studySession, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log session", details: String(error) }, { status: 500 });
    }
}
