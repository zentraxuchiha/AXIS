import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Habit from "@/models/Habit";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const habit = await Habit.findOneAndDelete({ _id: id, userId: session.user.id });
        if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

        return NextResponse.json({ message: "Habit deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
    }
}
