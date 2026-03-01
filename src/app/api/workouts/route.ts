import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Workout from "@/models/Workout";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const workouts = await Workout.find({ userId: session.user.id }).sort({ date: -1 });
        return NextResponse.json(workouts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { type, durationMinutes, caloriesBurned } = await req.json();
        if (!type || !durationMinutes) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        await connectToDatabase();
        const workout = await Workout.create({
            userId: session.user.id,
            type,
            durationMinutes,
            caloriesBurned,
        });

        return NextResponse.json(workout, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log workout" }, { status: 500 });
    }
}
