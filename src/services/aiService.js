const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function processNotes(rawNotes) {
  if (!rawNotes || !rawNotes.trim()) return null;

  const splitIntoPoints = (text) => {
    if (!text || typeof text !== "string") return [];
    return text
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .slice(0, 6);
  };

  try {
    const response = await fetch(`${API_URL}/api/process-notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rawNotes })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'AI processing failed');
    }

    // Transform backend response to match expected format
    const summaryText = result.data.summary || "";
    const memoryLinks = Array.isArray(result.data.memoryLinks)
      ? result.data.memoryLinks
      : [];

    return {
      summary: {
        title: "So What? Summary",
        content: splitIntoPoints(summaryText).map((text) => ({ text })),
        note: summaryText && splitIntoPoints(summaryText).length === 0 ? summaryText : ""
      },
      glossary: result.data.glossary || [],
      memoryLink: {
        title: "Prepare for Next Class",
        subtitle: "Most important concept to review",
        keyPoint: memoryLinks[0]
          ? { title: "Key focus", description: memoryLinks[0] }
          : null,
        content: memoryLinks.slice(1).join(" ") || "",
        note: memoryLinks.length === 0 ? "" : ""
      }
    };

  } catch (err) {
    console.error("AI processing failed:", err);
    throw err; 
  }
}
