const path = require('path');
const fs = require('fs');

// Determine database type from environment variable
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let db;

if (DB_TYPE === 'postgresql' || process.env.DATABASE_URL) {
  // PostgreSQL Configuration for Production (Railway)
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  // Wrap PostgreSQL pool with SQLite-compatible interface
  db = {
    // Execute query with SQLite-style callback
    run(sql, params, callback) {
      const values = Array.isArray(params) ? params : [];
      pool.query(sql, values)
        .then(result => {
          if (callback) callback.call({ lastID: result.rows[0]?.id }, null);
        })
        .catch(err => {
          if (callback) callback(err);
        });
    },

    // Get single row
    get(sql, params, callback) {
      const values = Array.isArray(params) ? params : [];
      pool.query(sql, values)
        .then(result => {
          if (callback) callback(null, result.rows[0]);
        })
        .catch(err => {
          if (callback) callback(err, null);
        });
    },

    // Get all rows
    all(sql, params, callback) {
      const values = Array.isArray(params) ? params : [];
      pool.query(sql, values)
        .then(result => {
          if (callback) callback(null, result.rows);
        })
        .catch(err => {
          if (callback) callback(err, null);
        });
    },

    // Execute multiple statements (schema initialization)
    exec(sql, callback) {
      pool.query(sql)
        .then(() => {
          if (callback) callback(null);
        })
        .catch(err => {
          if (callback) callback(err);
        });
    },

    // For direct PostgreSQL queries
    query: pool.query.bind(pool),
    pool // Expose pool for advanced usage
  };

  console.log('Connected to PostgreSQL database');

  // Initialize PostgreSQL schema
  initializeDatabasePostgres();

} else {
  // SQLite Configuration for Development
  const sqlite3 = require('sqlite3').verbose();

  const dataDir = path.join(__dirname, '../../database');
  const dbPath = path.join(dataDir, 'portfolio.db');

  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Connect to SQLite database
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    } else {
      console.log('Connected to SQLite database:', dbPath);
    }
  });

  // Initialize SQLite schema
  initializeDatabaseSQLite();
}

// Initialize SQLite database from schema file
function initializeDatabaseSQLite() {
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

// Initialize PostgreSQL database from schema file
function initializeDatabasePostgres() {
  const schemaPath = path.join(__dirname, '../../database/schema-postgres.sql');

  if (!fs.existsSync(schemaPath)) {
    console.warn('PostgreSQL schema file not found:', schemaPath);
    console.warn('Run migration script to create tables');
    return;
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing PostgreSQL schema:', err.message);
    } else {
      console.log('PostgreSQL schema initialized successfully');
    }
  });
}

module.exports = db;
