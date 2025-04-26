// backend/routes/generateSet.js

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

router.post('/', async (req, res) => {
  const { topic, numTerms } = req.body;

  if (!topic || !numTerms) {
    return res.status(400).json({ error: 'Missing topic or numTerms' });
  }

  try {
    const prompt = `Create a list of ${numTerms} terms and definitions about ${topic}. Format each line as: Term: Definition.`;

    // Using Ollama to run the local LLaMA model
    const ollama = spawn('ollama', ['run', 'llama3:8b', prompt]);

    let output = '';
    ollama.stdout.on('data', (data) => {
      output += data.toString();
    });

    ollama.stderr.on('data', (data) => {
      console.error(`Ollama error: ${data}`);
    });

    ollama.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Ollama process failed' });
      }

      // 🛠️ Parse the output into terms
      const terms = output
        .split('\n')
        .filter(line => line.includes(':'))
        .map(line => {
          const [term, definition] = line.split(':').map(s => s.trim());
          return { term, definition };
        });

      res.json({ terms });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
