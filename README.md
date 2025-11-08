# Dolapo's Website

A cinematic portfolio built from scratch — blending filmmaking and full-stack development.  
Created by **Dolapo Ogunsola**, this project showcases the journey of a self-taught creative and engineer building his vision one frame and one line of code at a time.

---

## 🚀 Vision

I have a Sony FX30 with the goal to master color grading and to tell stories through films.  
I’m learning HTML, CSS, JavaScript, React, and Spring Boot to build a website that reflects that vision.

---

## 🧠 Project Goals

- 🎬 **Showcase Films** shot on the FX30 with cinematic color grading
- 📷 **Host Photos** from visual experiments, travels, and creative shoots
- ✍🏽 **Write Blogs** on filmmaking, faith, and my developer journey
- 🧰 **Learn by Doing** — master front-end and back-end skills through this site

---

## ⚙️ Tech Stack

| Layer      | Technology            |
|------------|------------------------|
| Frontend   | React.js 18 + Vite, Custom CSS |
| Backend    | Node.js + Express.js |
| Database   | SQLite (development), PostgreSQL (planned for production) |
| Authentication | JWT + bcrypt |
| File Storage | Local file system (uploads directory) |
| Hosting    | Vercel (Frontend), Railway/Render (Backend) |
| Tools      | GitHub, VS Code |

---

## 🎯 Features

### Public Features
- **Portfolio Gallery**: Browse video projects with category filtering
- **Video Player**: Watch videos with detailed project information
- **Responsive Design**: Cinematic dark theme that works on all devices
- **About Section**: Learn about Dolapo's journey and creative vision
- **Contact Form**: Get in touch via integrated Formspree

### Admin Features (Secret Access)
- **Secure Login**: Secret URL path + username/password authentication
- **Video Upload**: Upload videos up to 500MB with optional thumbnails
- **Content Management**: Edit video details, categories, and featured status
- **Video Deletion**: Remove videos and associated files
- **Analytics**: Track video views and engagement

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd dolapos_website
```

### 2. Backend Setup

```bash
cd backend
npm install

# Initialize database and create admin account
npm run init-db
# Follow prompts to set username, password, and secret path
# Example secret path: "my-unique-admin-path-2024"

# Start backend server
npm run dev
```

Backend runs on `http://localhost:5000`

**IMPORTANT**: Save your secret admin path! You'll need it to access the admin panel.

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Access Your Website

- **Public Site**: http://localhost:5173
- **Portfolio**: http://localhost:5173/work
- **Admin Login**: http://localhost:5173/admin/YOUR-SECRET-PATH
- **Admin Dashboard**: http://localhost:5173/admin/YOUR-SECRET-PATH/dashboard

---

## 📁 Project Structure

```
dolapos_website/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── routes/        # Page components
│   │   ├── App.jsx        # Main app with routing
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Node.js/Express API
│   ├── config/           # Database configuration
│   ├── middleware/       # Authentication middleware
│   ├── routes/           # API routes
│   ├── scripts/          # Database initialization
│   ├── uploads/          # Video & thumbnail storage
│   ├── data/             # SQLite database
│   ├── server.js         # Express server
│   └── package.json
│
└── README.md
```

---

## 🔐 Security Features

1. **Secret Admin Path**: Admin panel hidden behind a unique URL path
2. **Password Hashing**: bcrypt encryption for secure password storage
3. **JWT Tokens**: Stateless authentication for API requests
4. **File Validation**: Strict file type and size checking
5. **Protected Routes**: Admin endpoints require valid authentication

---

## 📖 Usage Guide

### Uploading Videos

1. Navigate to your secret admin URL
2. Login with your credentials
3. Fill in video details:
   - Title (required)
   - Description
   - Category (e.g., "commercial", "short-film", "music-video")
   - Upload video file (MP4, MOV, etc.)
   - Upload thumbnail (optional)
   - Mark as featured (optional)
4. Click "Upload Video"
5. Video appears on the portfolio page immediately

### Managing Videos

- **View**: Click any video in the admin dashboard to see details
- **Delete**: Click the delete button and confirm removal
- **Edit**: Update video metadata through the edit interface

---

## 🎨 Design Philosophy

This website features a **cinematic, minimalist design**:
- Dark black background (#000)
- Clean white typography
- Courier New monospace font for a technical aesthetic
- Generous spacing and elegant animations
- 16:9 aspect ratio for all video content
- Responsive grid layouts

---
