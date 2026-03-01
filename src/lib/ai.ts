import OpenAI from "openai";

const openRouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:4000",
        "X-Title": "AXIS AI",
    }
});

const directOpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIResponse(systemPrompt: string, userPrompt: string) {
    // 1. Primary: OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
        try {
            console.log("[AI] Attempting request via OpenRouter...");
            const response = await openRouter.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
            });

            if (response.choices?.[0]?.message?.content) {
                console.log("[AI] Success: Fulfilled by OpenRouter");
                return response.choices[0].message.content;
            }
        } catch (error: any) {
            console.error("[AI] OpenRouter call failed:", error?.message || "Unknown error");
        }
    }

    // 2. Secondary/Fallback: Direct OpenAI
    if (process.env.OPENAI_API_KEY) {
        try {
            console.log("[AI] Falling back to Direct OpenAI...");
            const response = await directOpenAI.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
            });

            if (response.choices?.[0]?.message?.content) {
                console.log("[AI] Success: Fulfilled by Direct OpenAI Fallback");
                return response.choices[0].message.content;
            }
        } catch (error: any) {
            console.error("[AI] Direct OpenAI Fallback failed:", error?.message || "Unknown error");
        }
    }

    console.error("[AI] FATAL: All AI channels (OpenRouter & OpenAI) have failed.");
    return null;
}
