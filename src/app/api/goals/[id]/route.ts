import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Goal from "@/models/Goal";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        await connectToDatabase();
        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { $set: body },
            { new: true }
        );
        if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        return NextResponse.json(goal);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update goal", details: String(error) }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        await Goal.findOneAndDelete({ _id: id, userId: session.user.id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete goal", details: String(error) }, { status: 500 });
    }
}
