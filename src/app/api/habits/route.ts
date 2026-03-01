import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Habit from "@/models/Habit";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.log("[HABITS GET] Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[HABITS GET] userId:", session.user.id);
        await connectToDatabase();
        const habits = await Habit.find({ userId: session.user.id }).sort({ createdAt: -1 });
        console.log("[HABITS GET] Found habits:", habits.length);
        return NextResponse.json(habits);
    } catch (error) {
        console.error("[HABITS GET] Error:", error);
        return NextResponse.json({ error: "Failed to fetch habits", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        console.log("[HABITS POST] Creating habit for userId:", session.user.id);
        await connectToDatabase();
        const habit = await Habit.create({
            userId: session.user.id,
            name,
        });

        console.log("[HABITS POST] Created habit:", habit._id);
        return NextResponse.json(habit, { status: 201 });
    } catch (error) {
        console.error("[HABITS POST] Error:", error);
        return NextResponse.json({ error: "Failed to create habit", details: String(error) }, { status: 500 });
    }
}
