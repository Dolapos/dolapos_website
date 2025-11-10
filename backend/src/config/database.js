const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dataDir = path.join(__dirname, '../../database');
const dbPath = path.join(dataDir, 'portfolio.db');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database:', dbPath);
  }
});

// Initialize database from schema file
function initializeDatabase() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');

  if (!fs.existsSync(schemaPath)) {
    console.error('Schema file not found:', schemaPath);
    return;
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing database schema:', err.message);
    } else {
      console.log('Database schema initialized successfully');
    }
  });
}

// Initialize on startup
initializeDatabase();

module.exports = db;
