// api/chat.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// Use Gemini 2.5 Pro model (or fall back to Flash if needed)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 150,
  }
});

export default async function handler(req, res) {
  // ===== CORS Configuration =====
  // Allow requests from any origin (adjust for production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  // ===== Validate API Key =====
  if (!process.env.GEMINI_KEY) {
    console.error('❌ GEMINI_KEY environment variable not set');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'API key not configured'
    });
  }

  // ===== Extract and Validate Prompt =====
  const { prompt } = req.body;
  
  // Check if prompt exists
  if (!prompt) {
    return res.status(400).json({ 
      error: 'Missing prompt',
      details: 'Request body must include a "prompt" field'
    });
  }

  // Check prompt length (1000 chars max)
  if (typeof prompt !== 'string' || prompt.length > 1000) {
    return res.status(400).json({ 
      error: 'Invalid prompt',
      details: 'Prompt must be a string with max 1000 characters'
    });
  }

  // Check for empty/whitespace-only prompts
  if (prompt.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Empty prompt',
      details: 'Prompt cannot be empty or whitespace only'
    });
  }

  // ===== Call Gemini API =====
  try {
    console.log(`📤 Sending prompt to Gemini (${prompt.length} chars)`);
    
    // Generate content with timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 15000)
      )
    ]);

    // ===== Extract Response Text =====
    // Gemini response structure: result.response.text()
    let reply;
    
    try {
      reply = result.response.text();
    } catch (textError) {
      console.error('❌ Error extracting text from response:', textError);
      
      // Try alternative extraction methods
      if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = result.response.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unable to extract text from AI response');
      }
    }

    // Validate response
    if (!reply || typeof reply !== 'string') {
      console.error('❌ Invalid response format:', result);
      return res.status(500).json({ 
        error: 'Invalid AI response',
        details: 'AI returned empty or malformed response'
      });
    }

    // Trim and limit response length
    reply = reply.trim().slice(0, 500);

    console.log(`✅ Gemini response received (${reply.length} chars)`);

    // Return successful response
    return res.status(200).json({ 
      reply,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    // ===== Comprehensive Error Handling =====
    console.error('❌ Gemini API Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });

    // Determine error type and appropriate response
    let statusCode = 500;
    let errorMessage = 'AI service error';
    let errorDetails = err.message;

    // Handle specific error types
    if (err.message?.includes('API key')) {
      statusCode = 401;
      errorMessage = 'Authentication error';
      errorDetails = 'Invalid or missing API key';
    } else if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded';
      errorDetails = 'Too many requests, please try again later';
    } else if (err.message?.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Request timeout';
      errorDetails = 'AI service took too long to respond';
    } else if (err.message?.includes('network') || err.message?.includes('ECONNREFUSED')) {
      statusCode = 503;
      errorMessage = 'Service unavailable';
      errorDetails = 'Unable to reach AI service';
    }

    return res.status(statusCode).json({ 
      error: errorMessage,
      details: errorDetails,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
}