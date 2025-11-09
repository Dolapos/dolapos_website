# Quick Start Guide - Dolapo's Portfolio

## ⚡ Get Up and Running in 5 Minutes

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ npm (comes with Node.js)
- ✅ IntelliJ IDEA Community Edition (or any IDE/text editor)

---

## Step 1: Install Dependencies

Open terminal in the project root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Step 2: Create Your Admin Account

**This is the most important step!**

```bash
cd backend
npm run init-db
```

You'll be prompted to enter:

```
Enter admin username: dolapo
Enter admin password: YourSecurePassword123
Enter secret admin path: dolapo-admin-2024
```

**IMPORTANT - Save these!**
- ✅ Username: `dolapo`
- ✅ Password: `YourSecurePassword123`
- ✅ Secret Path: `dolapo-admin-2024`

Your admin URL will be: `http://localhost:5173/admin/dolapo-admin-2024`

**The secret path is like a hidden URL - nobody can find your admin panel without it!**

---

## Step 3: Verify Database Setup

```bash
npm run check-db
```

You should see:

```
=== Database Status Check ===

✓ Database file found: /path/to/backend/data/portfolio.db
  File size: 12.00 KB

Database Tables:
  ✓ admin
  ✓ videos
  ✓ categories
  ✓ video_analytics

Admin Account:
  ✓ Username: dolapo
  ✓ Secret Path: dolapo-admin-2024
  ✓ Created: [timestamp]

🔐 Your Admin URL:
  http://localhost:5173/admin/dolapo-admin-2024
```

✅ **If you see this, database is set up correctly!**

❌ **If you see errors, run `npm run init-db` again**

---

## Step 4: Start the Backend

```bash
# In the backend folder
npm run dev
```

You should see:

```
Server running on port 5000
Environment: development
Connected to SQLite database: /path/to/data/portfolio.db
Database schema initialized successfully
Storage: Local filesystem (/path/to/uploads)
```

✅ **Leave this terminal running!**

---

## Step 5: Start the Frontend

Open a **NEW TERMINAL** window:

```bash
cd frontend
npm run dev
```

You should see:

```
  VITE v7.1.7  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **Leave this terminal running too!**

---

## Step 6: Access the Admin Panel 🎉

### Open your browser and go to:

```
http://localhost:5173/admin/YOUR-SECRET-PATH
```

Replace `YOUR-SECRET-PATH` with what you entered (e.g., `dolapo-admin-2024`)

**Example:**
```
http://localhost:5173/admin/dolapo-admin-2024
```

### You'll see the login page:

```
┌─────────────────────────┐
│    Admin Access         │
│ Enter your credentials  │
├─────────────────────────┤
│ Username: [dolapo    ]  │
│ Password: [••••••••••]  │
│                         │
│      [ Login ]          │
└─────────────────────────┘
```

Enter your username and password, click Login.

### After login, you'll be at the admin dashboard:

```
http://localhost:5173/admin/dolapo-admin-2024/dashboard
```

Here you can:
- ✅ Upload videos
- ✅ Add titles and descriptions
- ✅ Choose categories
- ✅ Upload custom thumbnails
- ✅ Mark videos as featured
- ✅ Delete videos
- ✅ View analytics (view counts)

---

## Step 7: Upload Your First Video

1. **Fill in the form:**
   - Title: "My First Film"
   - Description: "A short film I created"
   - Category: "short-film"
   - Video file: Select from your computer
   - Thumbnail: (optional) Select an image

2. **Click "Upload Video"**

3. **Wait for upload** (may take a few seconds/minutes depending on file size)

4. **Success!** Video will appear in the list below

---

## Step 8: View Your Video on the Public Site

1. Go to: `http://localhost:5173/work`

2. You'll see your video in the portfolio grid!

3. Click on it to watch

---

## 🎯 Important URLs to Remember

| Purpose | URL |
|---------|-----|
| **Homepage** | http://localhost:5173 |
| **Portfolio (Public)** | http://localhost:5173/work |
| **Admin Login** | http://localhost:5173/admin/YOUR-SECRET-PATH |
| **Admin Dashboard** | http://localhost:5173/admin/YOUR-SECRET-PATH/dashboard |
| **Backend API** | http://localhost:5000/api |

---

## 🔧 IntelliJ Tips

### Running from IntelliJ Terminal:

1. Open IntelliJ
2. Bottom toolbar → Terminal (Alt+F12)
3. Run the commands there

### Viewing Database (without Ultimate Edition):

Since Community Edition doesn't have database tools, use command line:

```bash
# Install sqlite3 command line (if not installed)
# macOS: brew install sqlite
# Ubuntu: sudo apt-get install sqlite3
# Windows: Download from https://sqlite.org/download.html

# Open database
cd backend
sqlite3 data/portfolio.db

# View tables
.tables

# View admin account
SELECT * FROM admin;

# View videos
SELECT id, title, category, view_count FROM videos;

# Exit
.exit
```

Or use a GUI tool like:
- **DB Browser for SQLite** (Free, cross-platform)
- Download: https://sqlitebrowser.org/

---

## 🐛 Troubleshooting

### "Cannot find module 'sqlite3'"
```bash
cd backend
npm install
```

### "Database file not found"
```bash
cd backend
npm run init-db
```

### "Port 5000 already in use"
```bash
# Find and kill the process
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

# Or change port in backend/.env:
PORT=5001
```

### "Admin path shows 404"
- Make sure you're using the EXACT secret path you entered
- Check your secret path: `npm run check-db`
- Make sure backend is running on port 5000

### "Videos not uploading"
- Check backend terminal for errors
- Make sure `backend/uploads/` folder exists (created automatically)
- Check file size (max 500MB)
- Check file type (mp4, mov, avi, etc.)

### "Forgot my admin password"
```bash
cd backend
npm run init-db
# This will create a new admin account (replaces old one)
```

### "Forgot my secret admin path"
```bash
cd backend
npm run check-db
# This will show your secret path
```

---

## 📖 Next Steps

1. **Upload a few videos** to test the system
2. **Customize categories** in the database or admin panel
3. **Try the category filter** on the portfolio page
4. **Check view counts** in the admin dashboard

When ready for production:
- Read `STORAGE_GUIDE.md` for AWS S3 setup
- Read `ARCHITECTURE.md` for deployment options

---

## 🎬 Your Workflow

**Development:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Upload videos via: http://localhost:5173/admin/YOUR-SECRET-PATH/dashboard
```

**Daily use:**
1. Start both servers
2. Go to admin dashboard
3. Upload new videos
4. View on public portfolio at /work

---

## 💡 Pro Tips

1. **Bookmark your admin URL** - it's secret!
2. **Use descriptive categories**: commercial, short-film, music-video, documentary
3. **Always upload thumbnails** - they look way better than placeholders
4. **Compress videos before uploading** - use HandBrake or similar tools
5. **Check analytics** - see which videos get the most views

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (backend and frontend)
- [ ] Database initialized (`npm run init-db`)
- [ ] Admin account created
- [ ] Database verified (`npm run check-db`)
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] Admin URL bookmarked
- [ ] First video uploaded
- [ ] Portfolio page viewed

---

**All set? Start uploading your films! 🎬**

Need help? Check:
- `backend/README.md` - API documentation
- `STORAGE_GUIDE.md` - Video storage details
- `ARCHITECTURE.md` - System architecture
