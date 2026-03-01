import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { generateAIResponse } from "@/lib/ai";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text, type } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // Resilient Database Usage Tracking
        try {
            await connectToDatabase();
            await User.findByIdAndUpdate(session.user.id, {
                $inc: { aiUsageCount: 1 }
            });
        } catch (dbError) {
            console.error("AI Usage Tracking Failed (DB Error):", dbError);
            // We continue anyway so the user gets their AI result
        }

        let systemPrompt = "";

        if (type === "summarize") {
            systemPrompt = "You are a stark, highly disciplined AI. Distill the following notes into the absolute minimum logical components. Use bullet points. Do not use filler words. Strip emotion and noise.";
        } else if (type === "resume") {
            systemPrompt = "You are an expert executive ATS-friendly resume optimizer. Format the provided input into a sharp, professional background summary and bulleted experience points suitable for a high-end black-and-white PDF.";
        }

        const result = await generateAIResponse(systemPrompt, text);

        if (!result) {
            return NextResponse.json({ error: "AI Service (OpenRouter) returned an empty response. Please verify your API key and balance." }, { status: 503 });
        }

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error("AI API Route Error:", error?.message || error);
        return NextResponse.json({ error: `AI Internal Error: ${error?.message || "Unknown error"}` }, { status: 500 });
    }
}
