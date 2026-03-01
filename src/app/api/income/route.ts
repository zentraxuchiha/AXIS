import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Income from "@/models/Income";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const income = await Income.find({ userId: session.user.id }).sort({ date: -1 });
        return NextResponse.json(income);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch income" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { amount, category, description, date } = await req.json();
        if (!amount || !category) return NextResponse.json({ error: "Amount and category are required" }, { status: 400 });

        await connectToDatabase();
        const income = await Income.create({
            userId: session.user.id,
            amount: Number(amount),
            category: category.toUpperCase(),
            description,
            date: date || new Date(),
        });

        return NextResponse.json(income, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log income" }, { status: 500 });
    }
}
