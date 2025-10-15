const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');
const { supabase } = require('../services/supabaseService');
const { Mistral } = require('@mistralai/mistralai');

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// POST /chat/message - send a message to the chatbot
router.post('/message', async (req, res) => {
  try {
    const { chatbotId, sessionId, message } = req.body;

    if (!chatbotId || !message) {
      return res.status(400).json({ error: 'chatbotId and message are required' });
    }

    // Get chatbot details
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Get or create chat session
    let chat;
    if (sessionId) {
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('session_id', sessionId)
        .eq('chatbot_id', chatbotId)
        .single();

      if (existingChat) {
        chat = existingChat;
      }
    }

    if (!chat) {
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          chatbot_id: chatbotId,
          session_id: sessionId || `session_${Date.now()}`
        })
        .select()
        .single();

      if (chatError) throw chatError;
      chat = newChat;
    }

    // Save user message
    await supabase
      .from('messages')
      .insert({
        chat_id: chat.id,
        role: 'user',
        content: message
      });

    // Get training documents for context (if any)
    const { data: documents } = await supabase
      .from('documents')
      .select('content, url, metadata')
      .eq('chatbot_id', chatbotId)
      .limit(20);

    // Smart context selection: Find most relevant documents
    let relevantDocs = [];
    if (documents && documents.length > 0) {
      // Simple relevance scoring based on keyword matching
      const messageLower = message.toLowerCase();
      const keywords = messageLower.split(' ').filter(w => w.length > 3);
      
      relevantDocs = documents.map(doc => {
        const contentLower = doc.content.toLowerCase();
        let score = 0;
        
        // Count keyword matches
        keywords.forEach(keyword => {
          const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
          score += matches;
        });
        
        return { ...doc, score };
      })
      .filter(doc => doc.score > 0) // Only keep docs with matches
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, 5); // Take top 5 most relevant (Mistral has 500k tokens/min!)

      // If no relevant docs found, take first 3 docs
      if (relevantDocs.length === 0) {
        relevantDocs = documents.slice(0, 3);
      }
    }

    // Build context from relevant documents (Mistral can handle much more context!)
    let context = '';
    if (relevantDocs.length > 0) {
      let totalChars = 0;
      const maxContextChars = 10000; // Increased from 3000 - Mistral has 500k tokens/min!
      const contextParts = [];
      
      for (const doc of relevantDocs) {
        const title = doc.metadata?.title || 'Page';
        const excerpt = doc.content.substring(0, 2500); // Increased from 1000 chars
        const part = `${title} (${doc.url}):\n${excerpt}`;
        
        if (totalChars + part.length > maxContextChars) break;
        
        contextParts.push(part);
        totalChars += part.length;
      }
      
      context = `\n\nRelevant information from the website:\n${contextParts.join('\n\n')}`;
    }

    // Generate AI response with Mistral AI
    const systemPrompt = `You are ${chatbot.name}, a helpful AI assistant for ${chatbot.website_url || 'this website'}.
${chatbot.greeting_message ? `Your greeting is: "${chatbot.greeting_message}"` : ''}

IMPORTANT INSTRUCTIONS:
- Use ONLY the information provided in the context below to answer questions
- If asked about specific products, prices, or availability, ALWAYS direct users to visit the website: ${chatbot.website_url || 'the website'}
- DO NOT make up product names, prices, or specifications
- If the context doesn't contain the answer, say "I don't have that specific information, but you can browse [category] at ${chatbot.website_url || 'our website'}"
- Be concise and helpful
- When relevant, provide direct links from the context

${context ? `Context from the website:\n${context}` : 'No specific context available for this question.'}

Remember: Direct users to the website for specific products, pricing, and availability!`;

    // Try Mistral with fallback to smaller model if rate limited
    let chatResponse;
    try {
      chatResponse = await mistral.chat.complete({
        model: 'mistral-small-latest', // Smaller model = higher rate limits
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        maxTokens: 1024,
      });
    } catch (error) {
      // If rate limited, try the tiny model
      if (error.statusCode === 429) {
        console.log('⚠️  Mistral rate limited, using tiny model...');
        chatResponse = await mistral.chat.complete({
          model: 'open-mistral-7b', // Smallest, fastest model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          maxTokens: 1024,
        });
      } else {
        throw error;
      }
    }

    const answer = chatResponse.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

    // Save assistant message
    await supabase
      .from('messages')
      .insert({
        chat_id: chat.id,
        role: 'assistant',
        content: answer
      });

    res.json({
      answer,
      chatId: chat.id,
      sessionId: sessionId || chat.session_id
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /chat/history/:chatbotId - get chat history
router.get('/history/:chatbotId', async (req, res) => {
  try {
    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        id,
        session_id,
        created_at,
        messages (
          role,
          content,
          created_at
        )
      `)
      .eq('chatbot_id', req.params.chatbotId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(chats || []);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /chat/history/:chatbotId - clear chat history
router.delete('/history/:chatbotId', async (req, res) => {
  try {
    const { data: chats } = await supabase
      .from('chats')
      .select('id')
      .eq('chatbot_id', req.params.chatbotId);

    if (chats && chats.length > 0) {
      const chatIds = chats.map(c => c.id);
      
      await supabase
        .from('messages')
        .delete()
        .in('chat_id', chatIds);

      await supabase
        .from('chats')
        .delete()
        .eq('chatbot_id', req.params.chatbotId);
    }

    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /chat - protected by auth (except in test mode) - LEGACY
router.post('/', (req, res, next) => {
  // Skip auth in test/development mode
  if (process.env.NODE_ENV !== 'production') {
    return chatController.handleChat(req, res);
  }
  // Use auth middleware in production
  requireAuth(req, res, next);
}, (req, res) => {
  req.body.userId = req.user?.id || req.body.userId;
  return chatController.handleChat(req, res);
});

module.exports = router;
