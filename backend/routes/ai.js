// /routes/ai.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
    try {
        const { topic, numTerms } = req.body;

        if (!topic || !numTerms) {
            return res.status(400).json({ error: 'Missing topic or numTerms' });
        }

        const prompt = `
You are a helpful study set generator. 
Only output valid pure JSON array, like this: [{"term": "CPU", "definition": "Central Processing Unit"}, {"term": "RAM", "definition": "Random Access Memory"}, ...].

Do not say anything else.

Create exactly ${numTerms} terms and definitions about "${topic}".
ONLY output the JSON array, no explanations, no extra text.
        `;

        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3:8b",
            prompt: prompt,
            stream: false
        });

        const aiOutput = response.data.response;

        let generatedSet;
        try {
            generatedSet = JSON.parse(aiOutput);
        } catch (error) {
            console.error('Failed to parse AI output:', error);
            return res.status(500).json({ error: 'Failed to parse AI output' });
        }

        // 🛠 FIX: Return terms key
        res.json({ terms: generatedSet });

    } catch (error) {
        console.error('AI generation failed:', error);
        res.status(500).json({ error: 'Failed to generate study set' });
    }
});

module.exports = router;
