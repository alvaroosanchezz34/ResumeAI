const openai = require('../../config/openai');

const generateContent = async (text) => {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You must respond only with valid JSON.'
            },
            {
                role: 'user',
                content: `
Generate:

1. summary
2. 5 test questions
3. 3 development questions
4. 5 flashcards

Return ONLY valid JSON with this format:

{
  "summary": "",
  "test": [],
  "development": [],
  "flashcards": []
}

TEXT:
"""${text}"""
`
            }
        ],
        temperature: 0.4,
    });

    const content = completion.choices[0].message.content;

    try {
        return JSON.parse(content);
    } catch (err) {
        console.error("AI returned invalid JSON:", content);
        throw new Error("Invalid AI response format");
    }
};


module.exports = { generateContent };
