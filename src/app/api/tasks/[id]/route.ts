import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { isCompleted } = await req.json();
        await connectToDatabase();

        const task = await Task.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { isCompleted },
            { new: true }
        );

        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const result = await Task.deleteOne({ _id: id, userId: session.user.id });

        if (result.deletedCount === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
