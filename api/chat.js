// api/chat.js  –  Vercel serverless function
import { OpenAI } from 'openai';          // npm i openai

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,     // injected by Vercel
});

export default async function handler(req, res) {
  // CORS headers so your front-end can call it
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { prompt } = req.body;
  if (!prompt || prompt.length > 1_000) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content.trim();
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'AI service unavailable' });
  }
}