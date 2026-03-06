const express = require('express');
const cors = require('cors');
require('dotenv').config();console.log('API KEY LOADED:', process.env.GEMINI_API_KEY ? 'YES' : 'NO - KEY IS MISSING');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = fs.readFileSync('./tech-briefs/snowboard_llm_system_prompt.txt', 'utf8');

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

const response = await fetch(
  'https://api.groq.com/openai/v1/chat/completions',
  {
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
  }
);

const data = await response.json();
console.log('GROQ RAW:', JSON.stringify(data, null, 2));
const reply = data?.choices?.[0]?.message?.content || 'Sorry, no response.';
res.json({ reply });
});

app.listen(3001, () => console.log('SnowBot API running on port 3001'));
