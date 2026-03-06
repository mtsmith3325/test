const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

const SYSTEM_PROMPT = fs.readFileSync(path.join(process.cwd(), 'tech-briefs/snowboard_llm_system_prompt.txt'), 'utf8');

module.exports = async function handler(req, res) {
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
}
