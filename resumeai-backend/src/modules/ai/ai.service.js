const openai = require('../../config/openai');

/**
 * @param {string} text - Texto a analizar
 * @param {string|null} language - Idioma forzado ('es','en','fr'...) o null para auto-detect
 */
const generateContent = async (text, language = null) => {
  const langInstruction = language
    ? `The user has explicitly selected "${language}" as the output language. You MUST write ALL output in that language regardless of the input text language.`
    : `ALWAYS detect the language of the input text and produce ALL output in that SAME language.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert study assistant. Your job is to transform educational text into structured study materials.

CRITICAL RULES:
1. You MUST respond ONLY with valid JSON — no markdown, no explanation, no extra text.
2. ${langInstruction}
3. Generate high-quality, exam-relevant content — not filler.`
      },
      {
        role: 'user',
        content: `Analyze the following text and generate structured study materials.

Return ONLY valid JSON with EXACTLY this structure:
{
  "detectedLanguage": "<2-letter ISO code of the OUTPUT language, e.g. 'es', 'en', 'fr'>",
  "title": "<A short, descriptive title for this content (max 8 words, in the output language)>",
  "summary": "<A comprehensive summary in 3-5 paragraphs. Cover all key concepts.>",
  "test": [
    {
      "question": "<Clear, exam-style question>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "correctAnswer": <index 0-3 of the correct option>
    }
  ],
  "development": [
    "<Open-ended essay question that requires deep understanding>",
    "<Another open question>",
    "<Another open question>"
  ],
  "flashcards": [
    { "front": "<Term or concept>", "back": "<Clear, concise definition or explanation>" },
    { "front": "<Term>", "back": "<Definition>" },
    { "front": "<Term>", "back": "<Definition>" },
    { "front": "<Term>", "back": "<Definition>" },
    { "front": "<Term>", "back": "<Definition>" }
  ]
}

Requirements:
- "test": exactly 5 multiple-choice questions with 4 options each, only one correct
- "development": exactly 3 open-ended questions
- "flashcards": exactly 5 cards covering the most important terms/concepts
- Make questions progressively harder (easy to medium to hard)
- Distractors in test options must be plausible, not obviously wrong

TEXT TO ANALYZE:
"""${text}"""
`
      }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  const raw = completion.choices[0].message.content;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('AI returned invalid JSON:', raw);
    throw new Error('Invalid AI response format');
  }

  return parsed;
};

module.exports = { generateContent };