# Video Storage Architecture Guide

## Understanding Video Storage

### The Right Way: Metadata in Database, Files in Storage

**IMPORTANT:** Videos are **NEVER** stored directly in the database. Here's why:

1. **Database Size**: Video files are huge (100MB-2GB+). Storing them in SQL would make your database massive and slow.
2. **Performance**: Databases are optimized for structured data, not large binary files.
3. **Scalability**: File storage systems (like S3) are designed for large files and can scale infinitely.
4. **Cost**: S3 storage is cheaper than database storage for large files.

### How It Works

```
┌─────────────────┐         ┌──────────────────┐
│   SQL Database  │         │  File Storage    │
├─────────────────┤         ├──────────────────┤
│ Video Metadata: │         │ Actual Files:    │
│ - ID            │ ─────>  │ - video.mp4      │
│ - Title         │         │ - thumbnail.jpg  │
│ - File Path/URL │         │                  │
│ - Size, Duration│         │                  │
│ - View Count    │         │                  │
└─────────────────┘         └──────────────────┘
```

**Database stores:** Metadata (title, description, file URL, size, etc.)
**File storage stores:** Actual video and thumbnail files

---

## Storage Options

### Option 1: Local Storage (Development)

**Use for:** Local development, testing
**Pros:**
- Simple setup
- No external dependencies
- No cost
- Fast for local development

**Cons:**
- Not scalable for production
- No CDN
- Server storage is limited
- Videos lost if server crashes

**Configuration:**
```bash
# In .env
STORAGE_TYPE=local
```

Videos stored in: `backend/uploads/videos/`
Thumbnails stored in: `backend/uploads/thumbnails/`

---

### Option 2: AWS S3 (Production - RECOMMENDED)

**Use for:** Production deployment
**Pros:**
- Unlimited storage
- High availability (99.99% uptime)
- CDN integration (CloudFront)
- Automatic backups
- Cost-effective (~$0.023/GB/month)
- Serves videos directly to users (reduces server load)

**Cons:**
- Requires AWS account
- Small cost (but worth it)
- Slightly more complex setup

**Configuration:**
```bash
# In .env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=dolapo-portfolio-videos
S3_REGION=us-east-1
```

---

## Setting Up AWS S3 (Step-by-Step)

### 1. Create AWS Account
- Go to https://aws.amazon.com/
- Sign up for free tier (12 months free with limits)
- Free tier includes: 5GB storage, 20,000 GET requests, 2,000 PUT requests per month

### 2. Create S3 Bucket

1. Go to AWS Console → S3
2. Click "Create bucket"
3. **Bucket name:** `dolapo-portfolio-videos` (must be globally unique)
4. **Region:** `us-east-1` (or closest to your users)
5. **Block Public Access:** Uncheck (we want videos publicly accessible)
6. Click "Create bucket"

### 3. Configure Bucket CORS

1. Go to your bucket → Permissions → CORS
2. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 4. Create IAM User

1. Go to AWS Console → IAM → Users
2. Click "Add user"
3. **Username:** `dolapo-portfolio-uploader`
4. **Access type:** Programmatic access
5. **Permissions:** Attach existing policy → `AmazonS3FullAccess` (or create custom policy)
6. Click through and **SAVE YOUR KEYS**:
   - Access Key ID
   - Secret Access Key

### 5. Update Backend Configuration

```bash
cd backend
npm run setup-s3  # Install AWS SDK
```

Update `.env`:
```bash
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJal...
S3_BUCKET_NAME=dolapo-portfolio-videos
S3_REGION=us-east-1
```

### 6. Restart Server

```bash
npm run dev
```

You should see: `Storage: AWS S3 (Bucket: dolapo-portfolio-videos, Region: us-east-1)`

---

## How Video Upload Works

### With Local Storage:

1. User uploads video via admin panel
2. Multer saves file to `backend/uploads/videos/abc123.mp4`
3. Database stores: `{ file_path: "/uploads/videos/abc123.mp4" }`
4. Video served from: `http://localhost:5000/uploads/videos/abc123.mp4`

### With S3 Storage:

1. User uploads video via admin panel
2. Multer temporarily saves file locally
3. Backend uploads file to S3 bucket
4. S3 returns URL: `https://dolapo-portfolio-videos.s3.amazonaws.com/videos/abc123.mp4`
5. Local temporary file is deleted
6. Database stores: `{ file_path: "https://...", storage_type: "s3" }`
7. Video served from: S3 URL (globally distributed)

---

## Database Schema (SQLite)

Using **SQLite** for development:
- Lightweight, file-based database
- No server setup needed
- Perfect for development
- Can handle thousands of videos

**Location:** `backend/data/portfolio.db`

**Schema:** See `backend/database/schema.sql`

### Key Tables:

**admin** - Admin authentication
```sql
- id, username, password (hashed), secret_path
```

**videos** - Video metadata (NOT the actual files!)
```sql
- id, title, description, filename
- file_path (URL or local path)
- thumbnail_path
- file_size, duration, category
- is_featured, view_count
- storage_type ('local' or 's3')
```

---

## Migration Guide: Local → S3

Already have videos in local storage? Here's how to migrate:

### Option 1: Manual Migration (Recommended)

1. Set up S3 bucket
2. Upload existing videos directly to S3 via AWS Console
3. Update database records to point to S3 URLs
4. Delete local files

### Option 2: Migration Script (Future Feature)

```bash
npm run migrate-to-s3
```

This will:
- Upload all local videos to S3
- Update database records
- Verify uploads
- Delete local copies

---

## Cost Estimation

### AWS S3 Pricing (as of 2024)

**Storage:**
- First 50 TB: $0.023 per GB/month
- Example: 100GB of videos = $2.30/month

**Data Transfer:**
- First 100GB/month: FREE
- Next 10TB: $0.09 per GB
- Example: 1,000 video views (100MB avg) = ~100GB = FREE

**Requests:**
- PUT (uploads): $0.005 per 1,000 requests
- GET (views): $0.0004 per 1,000 requests
- Example: 100 uploads + 10,000 views = $0.50 + $4.00 = $4.50/month

**Total for small portfolio:**
- Storage (50GB): ~$1.15/month
- Bandwidth (100GB views): FREE
- Requests: ~$1/month
- **TOTAL: ~$2-3/month**

**Free Tier (first 12 months):**
- 5GB storage: FREE
- 20,000 GET requests: FREE
- 2,000 PUT requests: FREE

---

## Best Practices

### 1. Video Optimization Before Upload
- Use H.264 codec for best compatibility
- Compress videos (aim for <100MB if possible)
- Use tools like HandBrake or FFmpeg

### 2. Thumbnails
- Always upload custom thumbnails (better UX)
- Use 1920x1080 images (16:9 ratio)
- Compress to <500KB

### 3. Organize by Category
- Use categories: `commercial`, `short-film`, `music-video`, etc.
- Makes browsing easier for visitors

### 4. Security
- Keep AWS credentials in `.env` (never commit!)
- Use IAM user with limited permissions (not root account)
- Enable S3 bucket versioning for backups

### 5. Performance
- Use CloudFront CDN with S3 for faster global delivery
- Enable S3 Transfer Acceleration for faster uploads
- Consider video streaming (HLS) for large files

---

## Troubleshooting

### "Cannot find module '@aws-sdk/client-s3'"
```bash
npm run setup-s3
```

### "Access Denied" when uploading to S3
- Check IAM user has S3 permissions
- Verify bucket name and region in `.env`
- Check bucket policy allows uploads

### Videos not loading from S3
- Verify bucket CORS configuration
- Check bucket is public or using presigned URLs
- Verify file was uploaded successfully (check S3 console)

### Database locked error
- Only one server instance should run at a time
- Check for zombie Node processes: `pkill -f node`

---

## Future Enhancements

- [ ] Video transcoding (convert to multiple formats)
- [ ] Adaptive bitrate streaming (HLS/DASH)
- [ ] CloudFront CDN integration
- [ ] Video compression pipeline
- [ ] Automatic thumbnail generation
- [ ] PostgreSQL support for production
- [ ] Video analytics (watch time, completion rate)

---

## Quick Reference

| Feature | Local Storage | AWS S3 |
|---------|--------------|--------|
| Setup Complexity | Easy | Medium |
| Cost | Free | ~$2-5/month |
| Scalability | Limited | Unlimited |
| Performance | Good locally | Excellent globally |
| Reliability | Low | 99.99% |
| CDN Support | No | Yes (CloudFront) |
| Best For | Development | Production |
