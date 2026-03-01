import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import AttendanceRecord from "@/models/AttendanceRecord";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        await AttendanceRecord.findOneAndDelete({ _id: id, userId: session.user.id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete record", details: String(error) }, { status: 500 });
    }
}
