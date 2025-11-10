# AWS S3 Setup Guide

## Why You Need S3

Railway (and most container platforms) use **ephemeral storage** - files uploaded to your server are **deleted** when the container restarts or redeploys. S3 provides **permanent cloud storage** for your video files.

---

## Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process (requires credit card, but S3 has a free tier)
4. Verify your email and phone number

---

## Step 2: Create S3 Bucket

### 2.1 Navigate to S3
1. Sign in to AWS Console: https://console.aws.amazon.com/
2. Search for "S3" in the top search bar
3. Click "S3" to open the S3 console

### 2.2 Create Bucket
1. Click **"Create bucket"** button
2. Configure the bucket:

   **Bucket name**: `dolapo-portfolio-videos` (must be globally unique)
   - If taken, try: `dolapo-portfolio-videos-2024` or `your-name-portfolio-videos`

   **AWS Region**: `us-east-1` (N. Virginia)
   - Choose region closest to your users for better performance
   - Remember this for your environment variables!

   **Object Ownership**: ACLs disabled (recommended)

   **Block Public Access settings**:
   - ✅ **UNCHECK** "Block all public access"
   - Check the acknowledgment box
   - Your videos need to be publicly accessible to play in browsers

   **Bucket Versioning**: Disabled (optional)

   **Default encryption**: Enable (Server-side encryption with Amazon S3 managed keys)

3. Click **"Create bucket"**

---

## Step 3: Configure Bucket CORS

CORS (Cross-Origin Resource Sharing) allows your frontend to load videos from S3.

### 3.1 Add CORS Policy
1. Click on your bucket name
2. Go to **"Permissions"** tab
3. Scroll down to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"**
5. Paste this configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

6. Click **"Save changes"**

**Note**: In production, replace `"*"` in AllowedOrigins with your actual domain:
```json
"AllowedOrigins": [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

---

## Step 4: Create IAM User with S3 Permissions

IAM (Identity and Access Management) provides secure access credentials for your application.

### 4.1 Navigate to IAM
1. Search for "IAM" in the AWS Console search bar
2. Click "IAM" to open the IAM console

### 4.2 Create IAM User
1. Click **"Users"** in the left sidebar
2. Click **"Create user"** button
3. **User name**: `dolapo-portfolio-app`
4. ✅ **CHECK** "Provide user access to the AWS Management Console" is **UNCHECKED** (we only need programmatic access)
5. Click **"Next"**

### 4.3 Set Permissions
1. Select **"Attach policies directly"**
2. Search for `AmazonS3FullAccess` and check the box
   - **For better security** (recommended): Create a custom policy with minimal permissions (see Advanced section)
3. Click **"Next"**
4. Review and click **"Create user"**

### 4.4 Create Access Keys
1. Click on the user name you just created
2. Go to **"Security credentials"** tab
3. Scroll down to **"Access keys"** section
4. Click **"Create access key"**
5. Select use case: **"Application running outside AWS"**
6. Click **"Next"**
7. Add description (optional): "Railway deployment"
8. Click **"Create access key"**

### 4.5 SAVE YOUR CREDENTIALS
**⚠️ CRITICAL: Save these immediately - you can't view them again!**

```
AWS_ACCESS_KEY_ID: AKIA... (20 characters)
AWS_SECRET_ACCESS_KEY: wJalr... (40 characters)
```

Copy these to a secure location. You'll add them to Railway environment variables.

9. Click **"Done"**

---

## Step 5: Test Your S3 Setup (Optional)

### Using AWS CLI (if installed):
```bash
# Configure AWS CLI
aws configure
# Enter your access key ID
# Enter your secret access key
# Enter region: us-east-1
# Enter output format: json

# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://dolapo-portfolio-videos/test.txt
aws s3 ls s3://dolapo-portfolio-videos/
aws s3 rm s3://dolapo-portfolio-videos/test.txt
```

### Using Your Application (after Railway deployment):
Your backend's S3 service will handle uploads automatically once configured.

---

## Step 6: Environment Variables for Railway

Once your Railway backend is set up, add these environment variables:

```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=AKIA...your-key...
AWS_SECRET_ACCESS_KEY=wJalr...your-secret...
S3_BUCKET_NAME=dolapo-portfolio-videos
S3_REGION=us-east-1
```

---

## Advanced: Custom IAM Policy (More Secure)

Instead of `AmazonS3FullAccess`, create a custom policy that only allows access to your specific bucket:

### Create Custom Policy
1. In IAM, click **"Policies"** → **"Create policy"**
2. Click **"JSON"** tab
3. Paste this policy (replace `dolapo-portfolio-videos` with your bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::dolapo-portfolio-videos",
                "arn:aws:s3:::dolapo-portfolio-videos/*"
            ]
        }
    ]
}
```

4. Click **"Next"**
5. Name: `DolapoPortfolioS3Access`
6. Click **"Create policy"**
7. When creating the IAM user, attach this custom policy instead of `AmazonS3FullAccess`

---

## Pricing Information

### S3 Free Tier (First 12 months):
- 5 GB of Standard storage
- 20,000 GET requests
- 2,000 PUT requests

### After Free Tier:
- Storage: ~$0.023 per GB/month
- GET requests: $0.0004 per 1,000 requests
- PUT requests: $0.005 per 1,000 requests
- Data transfer OUT: First 100 GB/month free, then $0.09/GB

**Example**: 10 GB of videos + 10,000 views/month ≈ $0.25-$0.50/month

---

## Troubleshooting

### Videos not loading?
- Check bucket CORS configuration
- Verify bucket is NOT blocking public access
- Check S3 URLs in browser developer console

### Upload failing?
- Verify IAM credentials are correct
- Check IAM user has S3 permissions
- Verify bucket name matches environment variable

### "Access Denied" errors?
- Check IAM policy allows PutObject, GetObject, DeleteObject
- Verify AWS credentials are set correctly in Railway

---

## Next Steps

After completing S3 setup:
1. ✅ Save your AWS credentials securely
2. ✅ Note your bucket name and region
3. ➡️ Continue to Railway deployment setup
4. ➡️ Add environment variables to Railway
5. ➡️ Test video upload through your deployed app

---

## Security Best Practices

1. **Never commit AWS credentials to Git**
   - Already in `.gitignore`: `.env`, `.env.local`

2. **Rotate access keys regularly**
   - Create new keys every 90 days
   - Delete old keys

3. **Use bucket policies for additional security**
   - Restrict access by IP if needed
   - Enable CloudFront CDN for better performance and security

4. **Enable S3 logging**
   - Track access to your bucket
   - Monitor for suspicious activity

---

**✅ Once you complete this setup, you'll have:**
- S3 bucket ready for video storage
- AWS credentials for your application
- Proper CORS configuration for browser access
- Secure IAM user with appropriate permissions
