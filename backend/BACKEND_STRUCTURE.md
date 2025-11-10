# Backend Directory Structure

This document describes the organized backend structure for the Dolapo's Portfolio API.

## Directory Layout

```
backend/
├── src/                      # Source code
│   ├── config/              # Configuration files
│   │   ├── database.js      # SQLite database setup
│   │   └── storage.js       # Storage configuration (local/S3)
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # JWT authentication middleware
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Authentication endpoints
│   │   └── videos.js        # Video management endpoints
│   ├── services/            # Business logic
│   │   └── s3Service.js     # AWS S3 operations
│   └── utils/               # Utility functions (for future use)
├── database/                # Database files
│   ├── schema.sql           # Database schema (SQL DDL)
│   └── portfolio.db         # SQLite database file (gitignored)
├── scripts/                 # Utility scripts
│   ├── initDb.js           # Initialize admin account
│   └── checkDatabase.js    # Verify database status
├── uploads/                 # Uploaded files (gitignored)
│   ├── videos/             # Video files
│   └── thumbnails/         # Thumbnail images
├── server.js               # Application entry point
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (gitignored)
└── .gitignore             # Git ignore rules
```

## File Descriptions

### Core Files

- **server.js**: Main application entry point, sets up Express server and middleware
- **package.json**: Node.js project configuration and dependencies

### Source Code (`src/`)

#### Config (`src/config/`)
- **database.js**: SQLite database connection and initialization
- **storage.js**: Storage configuration for local filesystem or AWS S3

#### Middleware (`src/middleware/`)
- **auth.js**: JWT token validation and authentication middleware

#### Routes (`src/routes/`)
- **auth.js**: Authentication endpoints (login, verify)
- **videos.js**: Video CRUD operations (upload, edit, delete, list)

#### Services (`src/services/`)
- **s3Service.js**: AWS S3 upload/download/delete operations

### Database (`database/`)
- **schema.sql**: Pure SQL schema definition
- **portfolio.db**: SQLite database file (auto-generated)

### Scripts (`scripts/`)
- **initDb.js**: Interactive script to create admin account
- **checkDatabase.js**: Verify database and show admin credentials

## Import Paths

All imports use relative paths from their location:

```javascript
// From server.js
require('./src/routes/auth')
require('./src/routes/videos')

// From src/routes/*.js
require('../config/database')
require('../middleware/auth')

// From scripts/*.js
require('../src/config/database')
```

## Running the Backend

```bash
# Install dependencies
npm install

# Initialize admin account
npm run init-db

# Check database status
npm run check-db

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here

# Optional: AWS S3 Configuration
STORAGE_TYPE=local
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## Notes

- All source code is now organized under `src/` for better structure
- Database and uploaded files remain at root level for easy access
- Scripts remain at root level as they're run independently
- The structure follows Node.js best practices for Express applications
