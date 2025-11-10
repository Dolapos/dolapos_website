# Dolapo's Portfolio - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                    │
│                         Port: 5173 (Development)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Public Routes:                      Admin Routes:                   │
│  ├── /                (Home)          ├── /admin/:secretPath         │
│  ├── /about           (About)         │   (Login)                    │
│  ├── /contact         (Contact)       └── /admin/:secretPath/dashboard│
│  ├── /work            (Portfolio)         (Upload & Manage)          │
│  └── /work/:id        (Video Detail)                                 │
│                                                                       │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                     │
│                         Port: 5000 (Development)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Public API:                        Protected API:                   │
│  ├── GET  /api/videos               ├── POST   /api/videos/upload    │
│  ├── GET  /api/videos/:id           ├── PUT    /api/videos/:id       │
│  └── GET  /api/health               ├── DELETE /api/videos/:id       │
│                                     │                                 │
│  Auth API:                          Requires JWT Token:              │
│  ├── GET  /auth/verify-path/:path   └── Authorization: Bearer <token>│
│  ├── POST /auth/login                                                │
│  └── POST /auth/verify                                               │
│                                                                       │
└───────┬───────────────────────────┬─────────────────────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌─────────────────┐         ┌──────────────────────────┐
│  SQLite Database│         │    File Storage          │
│  (Metadata Only)│         │                          │
├─────────────────┤         ├──────────────────────────┤
│                 │         │  Development:            │
│ Tables:         │         │  └── Local Filesystem    │
│ ├── admin       │         │      /uploads/videos/    │
│ ├── videos      │         │                          │
│ ├── categories  │         │  Production:             │
│ └── analytics   │         │  └── AWS S3 Bucket       │
│                 │         │      dolapo-videos/      │
│ Storage:        │         │                          │
│ /data/          │         │  Video Files:            │
│ portfolio.db    │         │  ├── video-uuid.mp4      │
│                 │         │  └── thumb-uuid.jpg      │
└─────────────────┘         └──────────────────────────┘
```

---

## Authentication Flow

```
┌────────────┐                ┌────────────┐                ┌──────────┐
│   Admin    │                │  Frontend  │                │  Backend │
│  (You!)    │                │            │                │          │
└─────┬──────┘                └─────┬──────┘                └────┬─────┘
      │                             │                            │
      │ 1. Navigate to secret URL   │                            │
      │ /admin/my-secret-path       │                            │
      ├────────────────────────────>│                            │
      │                             │                            │
      │                             │ 2. Verify path exists      │
      │                             ├──────────────────────────> │
      │                             │    GET /auth/verify-path   │
      │                             │                            │
      │                             │ 3. Path valid ✓            │
      │                             │<────────────────────────── │
      │                             │    { valid: true }         │
      │                             │                            │
      │ 4. Enter credentials        │                            │
      │ (username + password)       │                            │
      ├────────────────────────────>│                            │
      │                             │                            │
      │                             │ 5. Login request           │
      │                             ├──────────────────────────> │
      │                             │    POST /auth/login        │
      │                             │    { username, password,   │
      │                             │      secretPath }          │
      │                             │                            │
      │                             │ 6. Verify credentials      │
      │                             │    - Check username        │
      │                             │    - Compare password hash │
      │                             │    - Verify secret path    │
      │                             │                            │
      │                             │ 7. JWT Token ✓             │
      │                             │<────────────────────────── │
      │                             │    { token: "eyJhbG..." }  │
      │                             │                            │
      │                             │ 8. Store token in          │
      │                             │    localStorage            │
      │                             │                            │
      │ 9. Access dashboard         │                            │
      │ /admin/path/dashboard       │                            │
      ├────────────────────────────>│                            │
      │                             │                            │
      │                             │ 10. All requests include   │
      │                             │     Authorization header   │
      │                             ├──────────────────────────> │
      │                             │     Bearer <token>         │
      │                             │                            │
      │                             │ 11. Verify token ✓         │
      │                             │<────────────────────────── │
      │                             │                            │
      │ 12. Dashboard loaded        │                            │
      │<────────────────────────────┤                            │
      │                             │                            │
```

---

## Video Upload Flow

```
┌────────────┐         ┌────────────┐         ┌──────────┐         ┌─────────┐
│   Admin    │         │  Frontend  │         │  Backend │         │ Storage │
│  Dashboard │         │            │         │          │         │ (S3)    │
└─────┬──────┘         └─────┬──────┘         └────┬─────┘         └────┬────┘
      │                      │                     │                    │
      │ 1. Fill upload form  │                     │                    │
      │    - Title           │                     │                    │
      │    - Description     │                     │                    │
      │    - Category        │                     │                    │
      │    - Select video    │                     │                    │
      │    - Select thumbnail│                     │                    │
      ├─────────────────────>│                     │                    │
      │                      │                     │                    │
      │ 2. Click Upload      │                     │                    │
      ├─────────────────────>│                     │                    │
      │                      │                     │                    │
      │                      │ 3. POST upload      │                    │
      │                      │    multipart/form   │                    │
      │                      │    + JWT token      │                    │
      │                      ├────────────────────>│                    │
      │                      │                     │                    │
      │                      │                     │ 4. Verify JWT ✓    │
      │                      │                     │                    │
      │                      │                     │ 5. Validate files  │
      │                      │                     │    - Check type    │
      │                      │                     │    - Check size    │
      │                      │                     │                    │
      │                      │                     │ 6. Save to temp    │
      │                      │                     │    /tmp/video.mp4  │
      │                      │                     │                    │
      │                      │                     │ 7. Upload to S3    │
      │                      │                     ├───────────────────>│
      │                      │                     │    PUT video.mp4   │
      │                      │                     │                    │
      │                      │                     │ 8. S3 URL          │
      │                      │                     │<───────────────────┤
      │                      │                     │    https://...     │
      │                      │                     │                    │
      │                      │                     │ 9. Save metadata   │
      │                      │                     │    to database     │
      │                      │                     │    INSERT INTO     │
      │                      │                     │    videos...       │
      │                      │                     │                    │
      │                      │                     │ 10. Delete temp    │
      │                      │                     │     file           │
      │                      │                     │                    │
      │                      │ 11. Success ✓       │                    │
      │                      │<────────────────────┤                    │
      │                      │    { video: {...} } │                    │
      │                      │                     │                    │
      │ 12. Show success     │                     │                    │
      │     Refresh list     │                     │                    │
      │<─────────────────────┤                     │                    │
      │                      │                     │                    │
```

---

## Public Video Viewing Flow

```
┌────────────┐         ┌────────────┐         ┌──────────┐         ┌─────────┐
│  Visitor   │         │  Frontend  │         │  Backend │         │ Storage │
│            │         │            │         │          │         │ (S3)    │
└─────┬──────┘         └─────┬──────┘         └────┬─────┘         └────┬────┘
      │                      │                     │                    │
      │ 1. Visit /work       │                     │                    │
      ├─────────────────────>│                     │                    │
      │                      │                     │                    │
      │                      │ 2. GET all videos   │                    │
      │                      ├────────────────────>│                    │
      │                      │                     │                    │
      │                      │                     │ 3. Query database  │
      │                      │                     │    SELECT * FROM   │
      │                      │                     │    videos          │
      │                      │                     │                    │
      │                      │ 4. Video list       │                    │
      │                      │<────────────────────┤                    │
      │                      │    [{ id, title,    │                    │
      │                      │       file_path,    │                    │
      │                      │       thumbnail }]  │                    │
      │                      │                     │                    │
      │ 5. Display grid      │                     │                    │
      │<─────────────────────┤                     │                    │
      │                      │                     │                    │
      │ 6. Click video       │                     │                    │
      ├─────────────────────>│                     │                    │
      │                      │                     │                    │
      │                      │ 7. GET video/:id    │                    │
      │                      ├────────────────────>│                    │
      │                      │                     │                    │
      │                      │                     │ 8. Increment views │
      │                      │                     │    UPDATE videos   │
      │                      │                     │    SET view_count++│
      │                      │                     │                    │
      │                      │ 9. Video details    │                    │
      │                      │<────────────────────┤                    │
      │                      │    { id, title,     │                    │
      │                      │      file_path:     │                    │
      │                      │      "https://s3..."}                    │
      │                      │                     │                    │
      │ 10. Video player     │                     │                    │
      │     loads S3 URL     │                     │                    │
      │<─────────────────────┤                     │                    │
      │                      │                     │                    │
      │ 11. Stream video     │                     │                    │
      │     directly from S3 ├─────────────────────────────────────────>│
      │<─────────────────────┼─────────────────────────────────────────┤
      │                      │                     │                    │
```

**Key Point:** Video streaming happens **directly from S3 to visitor**. The backend is NOT involved in serving video data - it only provides the URL.

---

## Technology Stack Details

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 7.1.7
- **Routing:** React Router DOM 7.1.1
- **Styling:** Custom CSS (Cinematic dark theme)
- **State Management:** React hooks (useState, useEffect)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18
- **Database:** SQLite 3 (dev), PostgreSQL (production option)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **File Upload:** Multer
- **Storage:** Local filesystem or AWS S3

### Database Schema
- **admin:** User authentication
- **videos:** Video metadata (NOT binary data!)
- **categories:** Video categorization
- **video_analytics:** View tracking (optional)

### Security
- **Password Hashing:** bcrypt (10 rounds)
- **Token Expiry:** 24 hours
- **Secret Admin Path:** URL-based access control
- **CORS:** Configured for frontend domain
- **File Validation:** Type and size checks

---

## Deployment Architecture

### Development
```
┌──────────────┐     ┌──────────────┐
│  Frontend    │     │  Backend     │
│  localhost   │────>│  localhost   │
│  :5173       │     │  :5000       │
│              │     │              │
│  Vite Dev    │     │  Nodemon     │
│  Server      │     │              │
└──────────────┘     └──────┬───────┘
                            │
                      ┌─────▼──────┐
                      │   SQLite   │
                      │   Local    │
                      │   Files    │
                      └────────────┘
```

### Production (Recommended)
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │     │   Railway/   │     │   AWS S3     │
│   (Frontend) │────>│   Render     │────>│   (Videos)   │
│              │     │   (Backend)  │     │              │
│   React      │     │              │     │   CDN:       │
│   Build      │     │   Node.js    │     │   CloudFront │
│   Static     │     │   Express    │     │              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                      ┌─────▼──────┐
                      │ PostgreSQL │
                      │  Database  │
                      │            │
                      └────────────┘
```

---

## Security Considerations

### What's Protected
✅ Admin login (username + password + secret path)
✅ Video upload endpoints (JWT required)
✅ Video deletion endpoints (JWT required)
✅ Password storage (bcrypt hashed)
✅ File type validation
✅ File size limits

### What's Public
✅ Video viewing (intentionally public)
✅ Portfolio browsing
✅ Video metadata
✅ Thumbnails

### Threat Mitigation
- **Brute Force:** Secret path makes admin URL unknown
- **SQL Injection:** Parameterized queries
- **XSS:** React auto-escapes content
- **File Upload Attacks:** Type/size validation
- **Token Theft:** Short expiry (24h), HTTPS only in production

---

## Scalability Considerations

### Current Limits
- SQLite: ~140 TB database size (plenty for metadata)
- Videos: Unlimited (stored in S3)
- Concurrent users: ~100-1000 (Express default)

### Scaling Strategy
1. **Phase 1 (Current):** SQLite + Local/S3
2. **Phase 2 (Growth):** PostgreSQL + S3 + CDN
3. **Phase 3 (Scale):** Load balancer + Multiple backend instances
4. **Phase 4 (Enterprise):** Microservices + Kubernetes

---

## Cost Breakdown (Monthly)

### Development (FREE)
- Frontend: Vite dev server (free)
- Backend: Local Node.js (free)
- Database: SQLite file (free)
- Storage: Local filesystem (free)

### Production (Estimate)
- **Frontend (Vercel):** FREE
- **Backend (Railway/Render):** $5-7/month
- **S3 Storage (50GB videos):** ~$1.15/month
- **S3 Bandwidth (100GB views):** FREE (first 100GB)
- **PostgreSQL (optional):** $5/month (or free tier)
- **Domain:** $10-15/year

**Total: ~$6-12/month** for a professional portfolio site!

---

## Performance Metrics

- **Page Load:** <2 seconds
- **Video Start:** <3 seconds (depends on video size)
- **API Response:** <100ms (metadata queries)
- **Upload Speed:** Depends on internet (S3 accepts up to 5GB/file)

---

This architecture balances:
✅ Simplicity (for development)
✅ Scalability (for growth)
✅ Security (for protection)
✅ Cost (for sustainability)
