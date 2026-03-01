import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Expense from "@/models/Expense";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const expense = await Expense.findOneAndDelete({ _id: id, userId: session.user.id });

        if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
        return NextResponse.json({ message: "Expense deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
    }
}
