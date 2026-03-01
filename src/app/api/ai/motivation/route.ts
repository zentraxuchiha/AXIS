import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateAIResponse } from "@/lib/ai";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { stats, context, role } = await req.json();

        // Resilient Database Usage Tracking
        try {
            await connectToDatabase();
            await User.findByIdAndUpdate(session.user.id, { $inc: { aiUsageCount: 1 } });
        } catch (dbError) {
            console.error("Motivation Usage Tracking Failed (DB Error):", dbError);
        }

        const systemPrompt = `You are a supportive, human-like friend and mentor. 
        Your goal is to provide a short (1-2 sentence) high-impact motivational message to the user based on their performance stats.
        
        TONE REQUIRMENTS:
        - Be inspiring, hard-hitting, and punchy.
        - Avoid robotic or corporate language.
        - Speak like a close mentor who wants the user to succeed.
        
        STYLE EXAMPLES (Use this level of impact):
        - "Believe in yourself and all that you are. Something inside you is greater than any obstacle."
        - "Every setback is a setup for a comeback. Keep pushing forward."
        - "Dream big, work hard, stay focused, and surround yourself with greatness."
        - "Don't watch the clock; do what it does. Keep going."
        - "When you feel like quitting, remember why you started."
        
        If their stats are low, give them a "mental reset" quote. If they are doing great, celebrate their momentum.`;

        const userPrompt = `
        User Role: ${role || 'user'}
        Current Context: ${context || 'dashboard'}
        Stats: ${JSON.stringify(stats)}
        
        Write a short, friendly motivational message tailored to these numbers.`;

        const result = await generateAIResponse(systemPrompt, userPrompt);

        if (!result) {
            return NextResponse.json({ result: "You're doing great! Keep building your momentum." });
        }

        return NextResponse.json({ result });
    } catch (error) {
        console.error("Motivation API Error:", error);
        return NextResponse.json({ result: "Keep moving forward, one step at a time!" });
    }
}
