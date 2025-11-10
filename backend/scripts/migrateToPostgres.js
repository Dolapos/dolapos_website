/**
 * Database Migration Script: SQLite to PostgreSQL
 *
 * This script migrates data from local SQLite database to PostgreSQL
 * Run this ONCE after setting up Railway PostgreSQL database
 *
 * Prerequisites:
 * 1. Railway PostgreSQL database is created
 * 2. DATABASE_URL environment variable is set
 * 3. Local SQLite database exists with data to migrate
 *
 * Usage:
 *   DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/migrateToPostgres.js
 */

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is required');
  console.error('Usage: DATABASE_URL="postgresql://..." node scripts/migrateToPostgres.js');
  process.exit(1);
}

// SQLite database path
const sqliteDbPath = path.join(__dirname, '../database/portfolio.db');

if (!fs.existsSync(sqliteDbPath)) {
  console.error('❌ ERROR: SQLite database not found at:', sqliteDbPath);
  console.error('Nothing to migrate. You can create admin account directly in PostgreSQL.');
  process.exit(1);
}

// PostgreSQL connection
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// SQLite connection
const sqliteDb = new sqlite3.Database(sqliteDbPath);

async function migrateData() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Step 1: Create PostgreSQL schema
    console.log('📋 Step 1: Creating PostgreSQL tables...');
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pgPool.query(schema);
    console.log('✅ PostgreSQL schema created\n');

    // Step 2: Migrate admin table
    console.log('👤 Step 2: Migrating admin accounts...');
    const admins = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM admin', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const admin of admins) {
      await pgPool.query(
        `INSERT INTO admin (username, password, secret_path, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO NOTHING`,
        [admin.username, admin.password, admin.secret_path, admin.created_at, admin.updated_at]
      );
    }
    console.log(`✅ Migrated ${admins.length} admin account(s)\n`);

    // Step 3: Migrate categories
    console.log('📂 Step 3: Migrating categories...');
    const categories = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM categories', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const category of categories) {
      await pgPool.query(
        `INSERT INTO categories (name, description, display_order, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO NOTHING`,
        [category.name, category.description, category.display_order, category.created_at]
      );
    }
    console.log(`✅ Migrated ${categories.length} categories\n`);

    // Step 4: Migrate videos
    console.log('🎬 Step 4: Migrating video metadata...');
    const videos = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM videos', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const video of videos) {
      await pgPool.query(
        `INSERT INTO videos (id, title, description, filename, file_path, thumbnail_path,
                            duration, file_size, mime_type, category, is_featured,
                            view_count, storage_type, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING`,
        [
          video.id, video.title, video.description, video.filename,
          video.file_path, video.thumbnail_path, video.duration,
          video.file_size, video.mime_type, video.category,
          video.is_featured, video.view_count, video.storage_type,
          video.created_at, video.updated_at
        ]
      );
    }
    console.log(`✅ Migrated ${videos.length} video(s)\n`);

    // Step 5: Migrate analytics (optional)
    console.log('📊 Step 5: Migrating video analytics...');
    const analytics = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM video_analytics', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const analytic of analytics) {
      await pgPool.query(
        `INSERT INTO video_analytics (video_id, viewer_ip, user_agent, watched_duration, watched_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [analytic.video_id, analytic.viewer_ip, analytic.user_agent,
         analytic.watched_duration, analytic.watched_at]
      );
    }
    console.log(`✅ Migrated ${analytics.length} analytics record(s)\n`);

    // Migration complete
    console.log('🎉 Migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - Admin accounts: ${admins.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Videos: ${videos.length}`);
    console.log(`   - Analytics: ${analytics.length}`);
    console.log('\n✅ Your PostgreSQL database is ready for production!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Close connections
    sqliteDb.close();
    await pgPool.end();
  }
}

// Run migration
migrateData();
