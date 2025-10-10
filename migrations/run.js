const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function runMigrations() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Get already executed migrations
    const { rows: executed } = await client.query('SELECT name FROM migrations');
    const executedNames = new Set(executed.map(r => r.name));

    // Run pending migrations
    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`Migration ${file} already executed, skipping`);
        continue;
      }

      console.log(`Running migration ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Migration ${file} completed successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();