const axios = require('axios');

/**
 * generateAnswer - using Groq API (FREE!)
 * Input: { userId, message, contexts: [string] }
 */
async function generateAnswer({ userId, message, contexts = [] }) {
  // Check for API key
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured. Get a free key at https://console.groq.com');
  }

  try {
    // Build prompt
    const prompt = buildPrompt(message, contexts);
    console.log('Sending prompt to Groq...');

    // Call Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile", // Fast and powerful, FREE
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant answering customer questions based on the website content provided. Use only the relevant site content where possible and be concise."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const answer = response.data.choices[0].message.content;
    console.log('Groq response received successfully');
    return answer;

  } catch (err) {
    console.error('Groq API error:', err.response?.data || err.message);
    
    if (err.response?.status === 401) {
      return "API key is invalid. Please check your GROQ_API_KEY in the .env file.";
    }
    
    if (err.response?.status === 429) {
      return "Rate limit exceeded. Please try again in a moment.";
    }
    
    return "I apologize, but I'm having trouble processing your request at the moment.";
  }
}

function buildPrompt(message, contexts) {
  const contextText = contexts?.length ? 
    `Website content:\n${contexts.join('\n---\n')}` : 
    `Website content:\n- We provide innovative solutions for businesses\n- Our services include web development, mobile apps, and cloud solutions\n- Contact us at support@example.com or call 555-0123\n- We have over 10 years of experience in software development\n- Our team consists of expert developers, designers, and project managers`;
  
  return `${contextText}\n\nCustomer question: ${message}\nAnswer:`;
}

module.exports = { generateAnswer };