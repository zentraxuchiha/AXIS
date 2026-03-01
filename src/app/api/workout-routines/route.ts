import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import WorkoutRoutine from "@/models/WorkoutRoutine";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const routines = await WorkoutRoutine.find({ userId: session.user.id });
        return NextResponse.json(routines);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { dayOfWeek, exercises } = await req.json();
        await dbConnect();

        const routine = await WorkoutRoutine.findOneAndUpdate(
            { userId: session.user.id, dayOfWeek },
            { exercises },
            { upsert: true, new: true }
        );

        return NextResponse.json(routine);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
