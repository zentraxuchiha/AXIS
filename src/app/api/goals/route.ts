import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Goal from "@/models/Goal";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        const goals = await Goal.find({ userId: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json(goals);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch goals", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { title, targetDate, priority } = await req.json();
        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
        await connectToDatabase();
        const goal = await Goal.create({ userId: session.user.id, title, targetDate, priority: priority || 2 });
        return NextResponse.json(goal, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create goal", details: String(error) }, { status: 500 });
    }
}
