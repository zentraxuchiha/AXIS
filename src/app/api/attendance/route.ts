import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import AttendanceRecord from "@/models/AttendanceRecord";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        const records = await AttendanceRecord.find({ userId: session.user.id }).sort({ date: -1 });

        // Aggregate per-subject stats with Theory/Practical breakdown
        const subjectMap: Record<string, {
            theoryPresent: number; theoryTotal: number;
            practicalPresent: number; practicalTotal: number;
            totalPresent: number; totalTotal: number;
        }> = {};

        records.forEach((r) => {
            if (!subjectMap[r.subject]) {
                subjectMap[r.subject] = {
                    theoryPresent: 0, theoryTotal: 0,
                    practicalPresent: 0, practicalTotal: 0,
                    totalPresent: 0, totalTotal: 0
                };
            }

            subjectMap[r.subject].totalTotal++;
            if (r.status === "present") subjectMap[r.subject].totalPresent++;

            if (r.type === "theory") {
                subjectMap[r.subject].theoryTotal++;
                if (r.status === "present") subjectMap[r.subject].theoryPresent++;
            } else {
                subjectMap[r.subject].practicalTotal++;
                if (r.status === "present") subjectMap[r.subject].practicalPresent++;
            }
        });

        const subjects = Object.entries(subjectMap).map(([name, stats]) => ({
            name,
            present: stats.totalPresent,
            total: stats.totalTotal,
            percentage: Math.round((stats.totalPresent / stats.totalTotal) * 100),
            theory: {
                present: stats.theoryPresent,
                total: stats.theoryTotal,
                percentage: stats.theoryTotal > 0 ? Math.round((stats.theoryPresent / stats.theoryTotal) * 100) : 0
            },
            practical: {
                present: stats.practicalPresent,
                total: stats.practicalTotal,
                percentage: stats.practicalTotal > 0 ? Math.round((stats.practicalPresent / stats.practicalTotal) * 100) : 0
            }
        }));

        return NextResponse.json({ records, subjects });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch attendance", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { subject, status, date, type } = await req.json();
        if (!subject || !status || !type) return NextResponse.json({ error: "Subject, status and type required" }, { status: 400 });
        await connectToDatabase();
        const record = await AttendanceRecord.create({
            userId: session.user.id,
            subject,
            status,
            type,
            date: date ? new Date(date) : new Date()
        });
        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log attendance", details: String(error) }, { status: 500 });
    }
}
