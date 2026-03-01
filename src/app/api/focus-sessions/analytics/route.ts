import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import FocusSession from "@/models/FocusSession";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();

        const now = new Date();
        // Start of the current week (Monday)
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        monday.setHours(0, 0, 0, 0);

        // All sessions from last 30 days
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const sessions = await FocusSession.find({
            userId: session.user.id,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 });

        // 7-day bar chart data
        const weekData = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            const dayEnd = new Date(day);
            dayEnd.setHours(23, 59, 59, 999);
            const dayMins = sessions
                .filter((s) => new Date(s.date) >= day && new Date(s.date) <= dayEnd)
                .reduce((sum, s) => sum + s.durationMinutes, 0);
            return { day: day.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(), minutes: dayMins };
        });

        // Top labels
        const labelMap: Record<string, number> = {};
        sessions.forEach((s) => {
            labelMap[s.label] = (labelMap[s.label] || 0) + s.durationMinutes;
        });
        const topLabels = Object.entries(labelMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([label, minutes]) => ({ label, hours: +(minutes / 60).toFixed(1) }));

        // Stats
        const todayMins = sessions.filter((s) => {
            const d = new Date(s.date);
            return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).reduce((sum, s) => sum + s.durationMinutes, 0);

        const weekMins = sessions
            .filter((s) => new Date(s.date) >= monday)
            .reduce((sum, s) => sum + s.durationMinutes, 0);

        const bestDay = weekData.reduce((best, d) => d.minutes > best.minutes ? d : best, { day: "N/A", minutes: 0 });

        return NextResponse.json({
            weekData,
            topLabels,
            stats: {
                todayHours: +(todayMins / 60).toFixed(1),
                weekHours: +(weekMins / 60).toFixed(1),
                bestDay: bestDay.day,
                totalSessions: sessions.length,
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch analytics", details: String(error) }, { status: 500 });
    }
}
