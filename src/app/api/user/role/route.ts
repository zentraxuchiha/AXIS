import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { role } = await req.json();

        if (role !== 'student' && role !== 'working_professional') {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        await connectToDatabase();

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { role },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        console.error("[ROLE POST] Error:", error);
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}
