const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

// Only create client if credentials are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase credentials not configured, auth features will be disabled');
  // Provide mock client for development
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'test-user-123' } }, error: null })
    },
    from: () => ({
      select: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null })
    })
  };
}

/**
 * Verify a JWT token from Supabase
 * @param {string} token - JWT token from Authorization header
 * @returns {Promise<Object>} User data if valid, null if invalid
 */
async function verifyToken(token) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Get user profile data
 * @param {string} userId - Supabase user ID
 */
async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user profile
 * @param {string} userId - Supabase user ID
 * @param {Object} updates - Profile fields to update
 */
async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  verifyToken,
  getUserProfile,
  updateUserProfile
};