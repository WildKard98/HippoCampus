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
    You are a helpful and professional study set generator.
    
    Your job is to ONLY return a valid JSON array like this:
    [
      {"term": "CPU", "definition": "The Central Processing Unit, which performs most of the processing inside a computer."},
      {"term": "RAM", "definition": "Random Access Memory, which stores data temporarily for quick access."}
    ]
    
    ⚠️ IMPORTANT RULES:
    - Generate exactly ${numTerms} unique term-definition pairs.
    - All terms must be in: ${termLanguage}.
    - All definitions must be in: ${definitionLanguage}.
    - Every definition must be **at least 12 words long** and **clearly explain the term.**
    - Do NOT include extra text or comments. Just the JSON array.
    - DO NOT explain your output or add anything outside the array.
    
    TOPIC: "${topic}"
    
    Return only the JSON array now.
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
