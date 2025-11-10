/**
 * Initialize PostgreSQL Database with Admin Account
 *
 * This script creates an admin account in PostgreSQL database
 * Use this for fresh Railway deployments (no data to migrate)
 *
 * Prerequisites:
 * 1. Railway PostgreSQL database is created and running
 * 2. DATABASE_URL environment variable is set (Railway provides this)
 *
 * Usage:
 *   # Use Railway's PostgreSQL URL
 *   DATABASE_URL="postgresql://..." node scripts/initDbPostgres.js
 *
 *   # Or run directly on Railway via shell
 *   railway run node scripts/initDbPostgres.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is required');
  console.error('Usage: DATABASE_URL="postgresql://..." node scripts/initDbPostgres.js');
  process.exit(1);
}

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing PostgreSQL database...\n');

    // Step 1: Create schema
    console.log('📋 Step 1: Creating database schema...');
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');

    if (!fs.existsSync(schemaPath)) {
      console.error('❌ ERROR: schema-postgres.sql not found at:', schemaPath);
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema created successfully\n');

    // Step 2: Check if admin already exists
    console.log('👤 Step 2: Checking for existing admin account...');
    const existingAdmin = await pool.query('SELECT * FROM admin LIMIT 1');

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin account already exists!');
      console.log('   Username:', existingAdmin.rows[0].username);
      console.log('   Secret path:', existingAdmin.rows[0].secret_path);
      console.log('\n✅ Database is already initialized');
      rl.close();
      await pool.end();
      return;
    }

    // Step 3: Create admin account
    console.log('📝 Step 3: Creating admin account...\n');

    const username = await askQuestion('Enter admin username (default: admin): ') || 'admin';
    const password = await askQuestion('Enter admin password (default: admin123): ') || 'admin123';
    const secretPath = await askQuestion('Enter secret admin path (default: random): ') || uuidv4();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    await pool.query(
      `INSERT INTO admin (username, password, secret_path)
       VALUES ($1, $2, $3)`,
      [username, hashedPassword, secretPath]
    );

    console.log('\n✅ Admin account created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ADMIN CREDENTIALS (Save these securely!)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Username:     ${username}`);
    console.log(`Password:     ${password}`);
    console.log(`Secret Path:  ${secretPath}`);
    console.log('\n🔗 Admin Login URL:');
    console.log(`   https://your-domain.railway.app/${secretPath}/admin/login`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('⚠️  IMPORTANT: Save these credentials in a secure location!');
    console.log('   You cannot retrieve the secret path later.\n');

    console.log('✅ Database initialization complete!');

  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
