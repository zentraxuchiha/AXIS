import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import AcademicRoutine from "@/models/AcademicRoutine";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        await connectToDatabase();

        // Build update: handle null values with $unset so completedOn can be cleared
        const setFields: Record<string, any> = {};
        const unsetFields: Record<string, number> = {};
        for (const [key, value] of Object.entries(body)) {
            if (value === null || value === undefined) {
                unsetFields[key] = 1;
            } else {
                setFields[key] = value;
            }
        }
        const update: Record<string, any> = {};
        if (Object.keys(setFields).length) update.$set = setFields;
        if (Object.keys(unsetFields).length) update.$unset = unsetFields;

        const routine = await AcademicRoutine.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            update,
            { new: true }
        );
        if (!routine) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(routine);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update routine", details: String(error) }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        await AcademicRoutine.findOneAndDelete({ _id: id, userId: session.user.id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete routine", details: String(error) }, { status: 500 });
    }
}
