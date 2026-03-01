const OpenAI = require("openai");
require("dotenv").config({ path: "d:/backup/NEW SOFTWARE/axis/.env" });

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
});

async function test() {
    try {
        console.log("Testing AI connection...");
        const response = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Say hello!" }
            ],
        });
        console.log("AI Response:", response.choices[0].message.content);
    } catch (error) {
        console.error("AI Error:", error);
    }
}

test();
