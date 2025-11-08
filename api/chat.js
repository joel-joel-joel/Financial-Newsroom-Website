// api/chat.js  –  Gemini version
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });


export default async function handler(req, res) {
  // CORS for local & prod
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
    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    return res.status(200).json({ reply });
  } catch (err) {
  console.error('Gemini raw error:', err);   // ← log full object
  return res.status(500).json({ error: err.message }); // send it back
}
}