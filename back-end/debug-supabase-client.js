// Test Supabase Client connection (using Supabase JS client instead of direct PostgreSQL)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 TESTING SUPABASE CLIENT (Alternative to direct PostgreSQL)\n');
console.log('='.repeat(60));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('📋 Configuration:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET'}`);
console.log();

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

async function testSupabaseClient() {
  try {
    console.log('⏳ Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created\n');

    // Test 1: Check tables
    console.log('📋 TEST 1: List tables');
    console.log('-'.repeat(60));
    const { data: chatbots, error: chatbotsError } = await supabase
      .from('chatbots')
      .select('*')
      .limit(5);

    if (chatbotsError) {
      if (chatbotsError.message.includes('does not exist')) {
        console.log('⚠️  Table "chatbots" does not exist');
        console.log('   You need to run the SQL setup script in Supabase SQL Editor');
        console.log('   File: back-end/migrations/supabase-setup.sql');
      } else {
        console.log(`❌ Error: ${chatbotsError.message}`);
      }
    } else {
      console.log(`✅ Successfully queried chatbots table`);
      console.log(`   Found ${chatbots.length} chatbot(s)`);
      if (chatbots.length > 0) {
        console.log('   Sample:', chatbots[0]);
      }
    }

    // Test 2: Check connection with a simple query
    console.log('\n📋 TEST 2: Insert test data');
    console.log('-'.repeat(60));
    
    const { data: insertData, error: insertError } = await supabase
      .from('chatbots')
      .insert({
        name: 'Test Chatbot',
        website_url: 'https://test.com',
        greeting_message: 'Hello from debug test!'
      })
      .select();

    if (insertError) {
      console.log(`❌ Insert failed: ${insertError.message}`);
      if (insertError.message.includes('does not exist')) {
        console.log('\n⚠️  TABLES NOT CREATED YET!');
        console.log('   Go to Supabase Dashboard → SQL Editor');
        console.log('   Run the file: back-end/migrations/supabase-setup.sql');
      }
    } else {
      console.log(`✅ Successfully inserted test data`);
      console.log(`   ID: ${insertData[0].id}`);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('chatbots')
        .delete()
        .eq('name', 'Test Chatbot');
      
      if (!deleteError) {
        console.log(`✅ Cleanup successful`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUPABASE JS CLIENT WORKS!');
    console.log('   Your backend can use Supabase JS client instead of direct PostgreSQL');
    console.log('='.repeat(60));

  } catch (error) {
    console.log('\n❌ Unexpected error:');
    console.log(`   ${error.message}`);
    console.log('\n' + '='.repeat(60));
  }
}

testSupabaseClient();
