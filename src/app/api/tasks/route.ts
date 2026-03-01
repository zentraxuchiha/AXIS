import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.log("[TASKS GET] Unauthorized - no session user id");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[TASKS GET] userId:", session.user.id);
        await connectToDatabase();
        const tasks = await Task.find({ userId: session.user.id }).sort({ isCompleted: 1, priority: 1, createdAt: -1 });
        console.log("[TASKS GET] Found tasks:", tasks.length);
        return NextResponse.json(tasks);
    } catch (error: any) {
        console.error("[TASKS GET] Error:", error?.message || error);
        return NextResponse.json({
            error: "Failed to fetch tasks",
            message: error?.message || "Unknown error"
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, priority, dueDate } = await req.json();
        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

        console.log("[TASKS POST] Creating task for userId:", session.user.id);
        await connectToDatabase();
        const task = await Task.create({
            userId: session.user.id,
            title,
            priority: priority || 2,
            dueDate,
        });

        console.log("[TASKS POST] Created task:", task._id);
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("[TASKS POST] Error:", error);
        return NextResponse.json({ error: "Failed to create task", details: String(error) }, { status: 500 });
    }
}
