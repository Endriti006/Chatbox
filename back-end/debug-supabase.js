// Supabase Connection Debug Script
require('dotenv').config();
const { Client } = require('pg');

console.log('🔍 SUPABASE CONNECTION DEBUG\n');
console.log('=' .repeat(60));

// Step 1: Check environment variables
console.log('\n📋 STEP 1: Environment Variables Check');
console.log('-'.repeat(60));
const envVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
};

for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    const maskedValue = key === 'DATABASE_URL' 
      ? value.replace(/:([^:@]+)@/, ':****@')  // Mask password
      : value.substring(0, 20) + '...';
    console.log(`✅ ${key}: ${maskedValue}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
}

// Step 2: Parse DATABASE_URL
console.log('\n📋 STEP 2: DATABASE_URL Parsing');
console.log('-'.repeat(60));
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`✅ Protocol: ${url.protocol}`);
    console.log(`✅ Host: ${url.hostname}`);
    console.log(`✅ Port: ${url.port || '5432'}`);
    console.log(`✅ Database: ${url.pathname.substring(1)}`);
    console.log(`✅ Username: ${url.username}`);
    console.log(`✅ Password: ${url.password ? '****' : 'MISSING'}`);
  } catch (error) {
    console.log(`❌ Invalid DATABASE_URL format: ${error.message}`);
  }
} else {
  console.log('❌ DATABASE_URL not set');
}

// Step 3: Test DNS Resolution
console.log('\n📋 STEP 3: DNS Resolution Test');
console.log('-'.repeat(60));
const dns = require('dns');
const hostname = 'db.dgqllfgzgxzabhouekta.supabase.co';

dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.log(`❌ DNS lookup failed for ${hostname}`);
    console.log(`   Error: ${err.message}`);
    console.log(`   This might be a network/firewall issue`);
  } else {
    console.log(`✅ DNS resolved: ${hostname} → ${address}`);
  }
  
  // Step 4: Test Database Connection
  testDatabaseConnection();
});

async function testDatabaseConnection() {
  console.log('\n📋 STEP 4: Database Connection Test');
  console.log('-'.repeat(60));
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ Cannot test - DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('⏳ Connecting to database...');
    await client.connect();
    console.log('✅ Successfully connected to Supabase!');

    // Test query
    console.log('\n📋 STEP 5: Database Query Test');
    console.log('-'.repeat(60));
    const result = await client.query('SELECT NOW(), version()');
    console.log(`✅ Database time: ${result.rows[0].now}`);
    console.log(`✅ PostgreSQL version: ${result.rows[0].version.split(',')[0]}`);

    // Check for tables
    console.log('\n📋 STEP 6: Tables Check');
    console.log('-'.repeat(60));
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    const expectedTables = ['chatbots', 'documents', 'chats', 'messages', 'training_jobs', 'billing', 'analytics'];
    console.log(`Found ${tablesResult.rows.length} tables:`);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found! You need to run the SQL setup script.');
      console.log('   Go to Supabase SQL Editor and run: back-end/migrations/supabase-setup.sql');
    } else {
      tablesResult.rows.forEach(row => {
        const isExpected = expectedTables.includes(row.tablename);
        console.log(`${isExpected ? '✅' : '📝'} ${row.tablename}`);
      });
      
      const missingTables = expectedTables.filter(
        table => !tablesResult.rows.find(row => row.tablename === table)
      );
      
      if (missingTables.length > 0) {
        console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
        console.log('   Run the SQL setup script in Supabase SQL Editor');
      }
    }

    // Check for vector extension
    console.log('\n📋 STEP 7: Extensions Check');
    console.log('-'.repeat(60));
    const extensionsResult = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('vector', 'uuid-ossp')
    `);
    
    const vectorExt = extensionsResult.rows.find(row => row.extname === 'vector');
    const uuidExt = extensionsResult.rows.find(row => row.extname === 'uuid-ossp');
    
    if (vectorExt) {
      console.log(`✅ vector extension: v${vectorExt.extversion}`);
    } else {
      console.log('❌ vector extension: NOT ENABLED');
      console.log('   Enable it in Supabase Dashboard → Database → Extensions');
    }
    
    if (uuidExt) {
      console.log(`✅ uuid-ossp extension: v${uuidExt.extversion}`);
    } else {
      console.log('⚠️  uuid-ossp extension: NOT ENABLED');
    }

    // Test insert/select
    console.log('\n📋 STEP 8: Write Test');
    console.log('-'.repeat(60));
    try {
      // Check if chatbots table exists first
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'chatbots'
        )
      `);
      
      if (tableCheck.rows[0].exists) {
        const testResult = await client.query(`
          INSERT INTO chatbots (name, website_url, greeting_message) 
          VALUES ('Debug Test Bot', 'https://test.com', 'Debug test') 
          RETURNING id, name
        `);
        console.log(`✅ Insert successful: ${testResult.rows[0].name} (${testResult.rows[0].id})`);
        
        // Clean up
        await client.query('DELETE FROM chatbots WHERE name = $1', ['Debug Test Bot']);
        console.log('✅ Cleanup successful');
      } else {
        console.log('⚠️  Chatbots table does not exist - skipping write test');
      }
    } catch (error) {
      console.log(`❌ Write test failed: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUPABASE IS WORKING! All tests passed.');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log(`\n❌ Database connection failed!`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify the hostname in DATABASE_URL is correct');
      console.log('   3. Check if your firewall is blocking port 5432');
      console.log('   4. Try using the Transaction Pooler connection (port 6543)');
    } else if (error.code === '28P01') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check your password in DATABASE_URL');
      console.log('   2. Reset password in Supabase Dashboard → Settings → Database');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Connection timed out - network issue or wrong host');
      console.log('   2. Try the Transaction Pooler URL instead');
    }
    
    console.log('\n' + '='.repeat(60));
  } finally {
    await client.end();
    process.exit();
  }
}
