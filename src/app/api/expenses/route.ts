import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Expense from "@/models/Expense";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        // Default to sorting by most recent
        const expenses = await Expense.find({ userId: session.user.id }).sort({ date: -1 });
        return NextResponse.json(expenses);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { amount, category, description, date } = await req.json();
        if (!amount || !category) return NextResponse.json({ error: "Amount and category are required" }, { status: 400 });

        await connectToDatabase();
        const expense = await Expense.create({
            userId: session.user.id,
            amount: Number(amount),
            category,
            description,
            date: date || new Date(),
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log expense" }, { status: 500 });
    }
}
