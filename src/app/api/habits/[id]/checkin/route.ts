import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Habit from "@/models/Habit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        // Check if recently completed to prevent double-logging today
        const habit = await Habit.findOne({ _id: id, userId: session.user.id });
        if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let lastCompleted = habit.lastCompletedDate ? new Date(habit.lastCompletedDate) : new Date(0);
        lastCompleted.setHours(0, 0, 0, 0);

        if (lastCompleted.getTime() === today.getTime()) {
            return NextResponse.json({ error: "Already completed today" }, { status: 400 });
        }

        // Determine streak continuity
        const diffDays = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
        let newStreak = habit.currentStreak;

        if (diffDays === 1) {
            newStreak += 1; // Continued
        } else if (diffDays > 1) {
            newStreak = 1; // Broken streak, restart
        } else if (habit.currentStreak === 0) {
            newStreak = 1; // First time
        }

        const updated = await Habit.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            {
                $push: { history: new Date() },
                currentStreak: newStreak,
                lastCompletedDate: new Date()
            },
            { new: true }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to log habit" }, { status: 500 });
    }
}
