const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
console.log('GROQ KEY LOADED:', process.env.GROQ_API_KEY ? 'YES' : 'NO - KEY IS MISSING');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SYSTEM_PROMPT = `You are SnowBot, an expert snowboarding assistant. You help users plan snowboarding trips by providing mountain recommendations with trail ratings, lodging options, and skill-based experiences for beginners through experts. Always ask for skill level if not provided. Be concise, enthusiastic, and safety-conscious. Respond in 3 sentences or less per section.`;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ]
    })
  });
  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content || 'Sorry, no response.';
  res.json({ reply });
});

app.listen(3001, () => console.log('SnowBot running on port 3001'));
