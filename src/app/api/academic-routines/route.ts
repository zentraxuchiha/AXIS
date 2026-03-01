import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import AcademicRoutine from "@/models/AcademicRoutine";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        const routines = await AcademicRoutine.find({ userId: session.user.id }).sort({ dayOfWeek: 1, time: 1 });
        return NextResponse.json(routines);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch routines", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { title, subject, dayOfWeek, time } = await req.json();
        if (!title || dayOfWeek === undefined || !time) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        await connectToDatabase();
        const routine = await AcademicRoutine.create({ userId: session.user.id, title, subject, dayOfWeek, time });
        return NextResponse.json(routine, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create routine", details: String(error) }, { status: 500 });
    }
}
