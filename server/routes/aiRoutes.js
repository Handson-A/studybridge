import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import process from 'process';

const router = express.Router();

// GET /api/models
router.get('/models', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured on server.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Model list failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const models = data?.models || [];

    res.json({
      success: true,
      models: models.map((model) => ({
        name: model.name,
        displayName: model.displayName,
        supportedGenerationMethods: model.supportedGenerationMethods
      }))
    });
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list models. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/process-notes
router.post('/process-notes', async (req, res) => {
  try {
    const { rawNotes } = req.body;

    // Validation
    if (!rawNotes || typeof rawNotes !== 'string' || !rawNotes.trim()) {
      return res.status(400).json({ 
        error: 'Invalid request. Please provide rawNotes as a non-empty string.' 
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured on server.' 
      });
    }

    // Initialize Gemini client with API key from env
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a study assistant for IT students. Transform raw lecture notes into structured study materials.

Your response MUST be valid JSON with this exact structure:
{
  "summary": "A comprehensive summary covering the main concepts and key takeaways from the lecture.",
  "glossary": [
    {
      "term": "Technical term or concept",
      "definition": "Clear, concise definition",
      "usage": "Example of how it's used in context"
    }
  ],
  "memoryLinks": [
    "Key concept or insight to remember for next class",
    "Important connection or prerequisite topic",
    "Practical application or review point"
  ]
}

Guidelines:
- Extract 5-10 key terms for the glossary
- Write a summary that captures the essence in 2-3 paragraphs
- Include 3-5 memory links focusing on what to review or prepare for next session
- Use clear, student-friendly language
- Return ONLY valid JSON, no markdown or code blocks

Notes:
${rawNotes}
`;

    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim();
      
      parsedResponse = JSON.parse(cleanedText);
    } catch (_) {
      console.error('Failed to parse Gemini response:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate response structure
    if (!parsedResponse.summary || !Array.isArray(parsedResponse.glossary) || !Array.isArray(parsedResponse.memoryLinks)) {
      throw new Error('Invalid response structure from AI');
    }

    // Return the processed result
    res.json({
      success: true,
      data: {
        summary: parsedResponse.summary,
        glossary: parsedResponse.glossary,
        memoryLinks: parsedResponse.memoryLinks
      }
    });

  } catch (error) {
    console.error('Error processing notes:', error);
    
    // Return appropriate error response
    res.status(500).json({
      success: false,
      error: 'Failed to process notes with AI. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
