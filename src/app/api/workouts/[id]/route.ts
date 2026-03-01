import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Workout from "@/models/Workout";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const workout = await Workout.findOneAndDelete({ _id: id, userId: session.user.id });

        if (!workout) return NextResponse.json({ error: "Workout not found" }, { status: 404 });
        return NextResponse.json({ message: "Workout deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete workout" }, { status: 500 });
    }
}
