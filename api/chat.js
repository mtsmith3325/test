const SYSTEM_PROMPT = `You are SnowBot, an expert snowboarding assistant. You help users plan snowboarding trips by providing mountain recommendations with trail ratings, lodging options, and skill-based experiences for beginners through experts. Always ask for skill level if not provided. Be concise, enthusiastic, and safety-conscious. Respond in 3 sentences or less per section.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
};
