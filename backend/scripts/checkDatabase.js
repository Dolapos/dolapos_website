#!/usr/bin/env node
// Database verification script

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/portfolio.db');

console.log('\n=== Database Status Check ===\n');

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file NOT found at:', dbPath);
  console.log('\nRun this to create it:');
  console.log('  npm run init-db\n');
  process.exit(1);
}

console.log('✓ Database file found:', dbPath);
console.log('  File size:', (fs.statSync(dbPath).size / 1024).toFixed(2), 'KB');
console.log('');

// Connect to database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
});

// Check tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('Error querying tables:', err.message);
    db.close();
    process.exit(1);
  }

  console.log('Database Tables:');
  if (tables.length === 0) {
    console.log('  ⚠️  No tables found! Database may not be initialized.');
    console.log('  Run: npm run init-db');
  } else {
    tables.forEach(table => {
      console.log('  ✓', table.name);
    });
  }
  console.log('');

  // Check admin account
  db.get('SELECT id, username, secret_path, created_at FROM admin LIMIT 1', [], (err, admin) => {
    if (err) {
      console.log('⚠️  Admin table exists but error querying:', err.message);
      console.log('   Run: npm run init-db');
    } else if (admin) {
      console.log('Admin Account:');
      console.log('  ✓ Username:', admin.username);
      console.log('  ✓ Secret Path:', admin.secret_path);
      console.log('  ✓ Created:', new Date(admin.created_at).toLocaleString());
      console.log('');
      console.log('🔐 Your Admin URL:');
      console.log('  http://localhost:5173/admin/' + admin.secret_path);
      console.log('');
    } else {
      console.log('⚠️  No admin account found!');
      console.log('  Run: npm run init-db');
      console.log('');
    }

    // Check videos
    db.all('SELECT COUNT(*) as count FROM videos', [], (err, result) => {
      if (err) {
        console.log('⚠️  Videos table error:', err.message);
      } else {
        const count = result[0].count;
        console.log('Videos:');
        console.log('  ', count, count === 1 ? 'video' : 'videos', 'in database');

        if (count > 0) {
          db.all('SELECT id, title, category, file_size, created_at FROM videos ORDER BY created_at DESC LIMIT 5', [], (err, videos) => {
            if (!err && videos.length > 0) {
              console.log('\n  Recent uploads:');
              videos.forEach(v => {
                const size = v.file_size ? (v.file_size / (1024 * 1024)).toFixed(2) + ' MB' : 'unknown';
                console.log(`    - ${v.title} [${v.category}] (${size})`);
              });
            }
          });
        }
      }
      console.log('');

      // Summary
      console.log('=== Summary ===');
      console.log('Database is ready! You can now:');
      console.log('  1. Start backend:  npm run dev');
      console.log('  2. Start frontend: cd ../frontend && npm run dev');
      console.log('  3. Access admin:   http://localhost:5173/admin/' + (admin ? admin.secret_path : 'YOUR-SECRET-PATH'));
      console.log('');

      db.close();
    });
  });
});
