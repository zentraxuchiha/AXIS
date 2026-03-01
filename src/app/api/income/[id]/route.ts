import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Income from "@/models/Income";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const income = await Income.findOneAndDelete({ _id: id, userId: session.user.id });

        if (!income) return NextResponse.json({ error: "Income not found" }, { status: 404 });
        return NextResponse.json({ message: "Income deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete income" }, { status: 500 });
    }
}
