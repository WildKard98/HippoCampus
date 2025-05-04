// /routes/ai.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const MAX_RETRIES = 3; // 💥 Max retry 3 times

router.post('/', async (req, res) => {
    const { topic, numTerms, termLanguage, definitionLanguage } = req.body;

    if (!topic || !numTerms) {
        return res.status(400).json({ error: 'Missing topic or numTerms' });
    }

    let tries = 0;
    let success = false;
    let generatedSet = null;

    const prompt = `
You are a helpful study set generator.
Your job is to ONLY return valid JSON array like this:
[{"term": "CPU", "definition": "Central Processing Unit"}, ...]

⚠️ IMPORTANT: 
- All terms have to be in language: **${termLanguage}**.
- All definitions have to be in **${definitionLanguage}**.
- Do NOT write anything in English unless requested.
- Do NOT include any explanations, greetings, or notes.
- Output ONLY the JSON array, no text before or after.
- The format must look exactly like this for example:
  [
    {"term": "ABC", "definition": "DEF"},
    {"term": "GHI", "definition": "JKL"}
  ]

Now create ${numTerms} term-definition pairs about: "${topic}".
`;


    while (tries < MAX_RETRIES && !success) {
        try {
            const response = await axios.post('http://localhost:11434/api/generate', {
                model: "llama3:8b",
                prompt: prompt,
                stream: false
            });

            const aiOutput = response.data.response;

            try {
                generatedSet = JSON.parse(aiOutput); // 🧠 Try to parse
                success = true; // ✅ success if parse OK
            } catch (parseError) {
                console.error(`❌ Parse attempt ${tries + 1} failed:`, parseError.message);
                tries++;
            }
        } catch (err) {
            console.error('❌ AI request error:', err.message);
            return res.status(500).json({ error: 'AI request failed' });
        }
    }

    if (!success) {
        return res.status(500).json({ error: 'Failed to parse AI output after retries' });
    }

    // ✅ If here, success
    res.json({ success: true, studySet: generatedSet });
});


module.exports = router;
