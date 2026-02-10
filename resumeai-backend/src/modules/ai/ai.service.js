const openai = require('../../config/openai');

const generateContent = async (text) => {
    const prompt = `
You are an educational AI.

From the following text, generate:
1. A concise but complete summary
2. 5 multiple choice questions (4 options, indicate correct index)
3. 3 open development questions
4. 5 flashcards (front/back)

Return ONLY valid JSON in this format:
{
  "summary": "",
  "test": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": 0
    }
  ],
  "development": [],
  "flashcards": [
    { "front": "", "back": "" }
  ]
}

TEXT:
"""${text}"""
`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
    });

    return JSON.parse(completion.choices[0].message.content);
};

module.exports = { generateContent };
