import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config(); // Ensure GEMINI_API_KEY is loaded

// Gemini client
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const optimizeService = {
    optimizeTitleDescription: async (title, description) => {
        const prompt = `
Improve product title and description for Google Merchant Center.
Make it SEO friendly, clean and professional.

OLD TITLE: ${title}
OLD DESCRIPTION: ${description}

Return strictly JSON only as:
{
  "title": "new title",
  "description": "new description"
}
    `;

        // Gemini API call
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash", // ya koi bhi Gemini model
            contents: prompt,
            config: {
                temperature: 0.8,
            },
        });

        // Gemini response text
        let text = response.text?.trim();

        // ✅ Clean code block or backticks if present
        if (text.startsWith("```")) {
            text = text.replace(/```json|```/g, "").trim();
        }

        try {
            return JSON.parse(text);
        } catch (err) {
            console.error("Failed to parse Gemini response:", text);
            throw err;
        }
    },
};

export default optimizeService;
