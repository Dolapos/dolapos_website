# Dolapo's Portfolio Backend

A secure Node.js/Express backend API for managing video uploads and admin authentication.

## Features

- **Secure Admin Authentication**: JWT-based authentication with secret path protection
- **Video Management**: Upload, view, update, and delete videos
- **SQLite Database**: Lightweight database for storing video metadata and admin credentials
- **File Upload**: Support for video files (MP4, MOV, etc.) and thumbnail images
- **RESTful API**: Clean API endpoints for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Initialize Database & Create Admin Account

Run the initialization script to create your admin account and secret access path:

```bash
npm run init-db
```

You'll be prompted to enter:
- **Username**: Your admin username
- **Password**: Your admin password (will be hashed)
- **Secret Path**: A unique secret URL path (e.g., "my-secret-admin-2024")

**IMPORTANT**: Keep your secret path safe! This is the only way to access your admin panel.

Your admin URL will be: `http://localhost:5173/admin/YOUR-SECRET-PATH`

### 3. Configure Environment Variables

The `.env` file has been created with default values. Update if needed:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-dolapo-2024
FRONTEND_URL=http://localhost:5173
```

**For Production**: Change the `JWT_SECRET` to a strong random string.

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Public Endpoints

#### Get All Videos
```
GET /api/videos
```
Returns all uploaded videos.

#### Get Single Video
```
GET /api/videos/:id
```
Returns a specific video by ID and increments view count.

### Protected Endpoints (Require Authentication)

#### Verify Secret Path
```
GET /api/auth/verify-path/:secretPath
```
Checks if a secret admin path is valid.

#### Admin Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "yourpassword",
  "secretPath": "your-secret-path"
}
```
Returns a JWT token for authenticated requests.

#### Upload Video
```
POST /api/videos/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Fields:
- video: Video file (required)
- thumbnail: Image file (optional)
- title: Video title (required)
- description: Video description
- category: Category name (default: "general")
- is_featured: Boolean (default: false)
```

#### Update Video
```
PUT /api/videos/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "updated-category",
  "is_featured": true
}
```

#### Delete Video
```
DELETE /api/videos/:id
Authorization: Bearer YOUR_JWT_TOKEN
```
Deletes video file, thumbnail, and database record.

## Database Schema

### Admin Table
```sql
- id: INTEGER PRIMARY KEY
- username: TEXT UNIQUE
- password: TEXT (bcrypt hashed)
- secret_path: TEXT UNIQUE
- created_at: DATETIME
```

### Videos Table
```sql
- id: TEXT PRIMARY KEY (UUID)
- title: TEXT
- description: TEXT
- filename: TEXT
- file_path: TEXT
- thumbnail_path: TEXT
- duration: INTEGER
- file_size: INTEGER
- category: TEXT
- is_featured: BOOLEAN
- view_count: INTEGER
- created_at: DATETIME
- updated_at: DATETIME
```

## File Storage

- **Videos**: Stored in `backend/uploads/videos/`
- **Thumbnails**: Stored in `backend/uploads/thumbnails/`
- **Database**: Stored in `backend/data/portfolio.db`

These directories are automatically created when the server starts.

## Security Features

1. **Secret Admin Path**: Admin panel is only accessible via a secret URL path that only you know
2. **Password Hashing**: Passwords are hashed using bcryptjs
3. **JWT Authentication**: Protected endpoints require valid JWT tokens
4. **File Validation**: Only allowed video and image formats are accepted
5. **File Size Limits**: Videos are limited to 500MB

## Troubleshooting

### Database Locked Error
If you get "database is locked", make sure only one instance of the server is running.

### Port Already in Use
Change the `PORT` in `.env` if port 5000 is already in use.

### Admin Account Reset
To reset your admin account, run `npm run init-db` again. It will replace the existing admin account.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Change `JWT_SECRET` to a strong random string
3. Update `FRONTEND_URL` to your production domain
4. Use a process manager like PM2:
   ```bash
   pm2 start server.js --name dolapos-backend
   ```

## Notes

- The uploads directory is in `.gitignore` to prevent committing large video files
- The `.env` file is in `.gitignore` to protect secrets
- Database file is in `.gitignore` for security
