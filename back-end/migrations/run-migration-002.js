const { supabase } = require('../src/services/supabaseService');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Running migration: 002_add_training_columns.sql');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '002_add_training_columns.sql'), 
      'utf8'
    );
    
    // Note: Supabase JS client doesn't support raw SQL execution
    // You need to run this in Supabase SQL Editor
    
    console.log('\n📋 SQL to run in Supabase SQL Editor:');
    console.log('=====================================');
    console.log(sql);
    console.log('=====================================\n');
    
    console.log('⚠️  Please copy the SQL above and run it in your Supabase SQL Editor:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Paste the SQL above');
    console.log('   5. Click "Run"');
    console.log('\nAlternatively, you can use the Supabase CLI or psql to run the migration.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
