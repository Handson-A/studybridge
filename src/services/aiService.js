// aiService.js
import { OPENAI_API_KEY } from "../utils/config.js"; // create a simple config file later

export async function processNotes(rawNotes) {
  if (!rawNotes || !rawNotes.trim()) return null;

  const prompt = `
You are a study assistant. Transform these raw notes into JSON containing:
1. Glossary: [{term, definition, sample usage}]
2. Summary: top 3 takeaways
3. Memory Link: a short prep and must from this for next class

Notes:
${rawNotes}

Return ONLY JSON.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    return JSON.parse(text);
  } catch (err) {
    console.error("AI processing failed:", err);
    return null;
  }
}
