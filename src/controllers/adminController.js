const { supabase } = require('../services/supabaseService');

/**
 * Get chat history for a user
 */
async function getChatHistory(userId, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

/**
 * Update chatbot settings
 */
async function updateChatbotSettings(userId, settings) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      chatbot_name: settings.name,
      chatbot_greeting: settings.greeting,
      chatbot_color: settings.color
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user settings
 */
async function getUserSettings(userId) {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw error;
  }

  // If no settings exist, create default settings
  if (!data) {
    const defaults = {
      user_id: userId,
      chat_model: 'gemini-pro',
      max_history: 10,
      temperature: 0.7,
      custom_settings: {}
    };

    const { data: newSettings, error: insertError } = await supabase
      .from('settings')
      .insert(defaults)
      .select()
      .single();

    if (insertError) throw insertError;
    return newSettings;
  }

  return data;
}

/**
 * Update user settings
 */
async function updateUserSettings(userId, settings) {
  // Remove non-updatable fields
  delete settings.user_id;
  delete settings.created_at;
  delete settings.updated_at;

  const { data, error } = await supabase
    .from('settings')
    .update(settings)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Rate a chat interaction
 */
async function rateChatInteraction(userId, chatId, rating) {
  const { data, error } = await supabase
    .from('chats')
    .update({ rating })
    .match({ id: chatId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  getChatHistory,
  updateChatbotSettings,
  getUserSettings,
  updateUserSettings,
  rateChatInteraction
};