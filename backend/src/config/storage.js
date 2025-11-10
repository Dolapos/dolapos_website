const fs = require('fs');
const path = require('path');

// Storage configuration
// Set STORAGE_TYPE in .env to 'local' or 's3'
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

// Local storage configuration
const LOCAL_UPLOADS_DIR = path.join(__dirname, '../uploads');
const LOCAL_VIDEOS_DIR = path.join(LOCAL_UPLOADS_DIR, 'videos');
const LOCAL_THUMBNAILS_DIR = path.join(LOCAL_UPLOADS_DIR, 'thumbnails');

// Create local directories if they don't exist
if (STORAGE_TYPE === 'local') {
  if (!fs.existsSync(LOCAL_VIDEOS_DIR)) {
    fs.mkdirSync(LOCAL_VIDEOS_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_THUMBNAILS_DIR)) {
    fs.mkdirSync(LOCAL_THUMBNAILS_DIR, { recursive: true });
  }
}

// AWS S3 configuration (optional - only needed if using S3)
let s3Client = null;
let S3_BUCKET_NAME = null;

if (STORAGE_TYPE === 's3') {
  try {
    const { S3Client } = require('@aws-sdk/client-s3');

    S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
    const S3_REGION = process.env.S3_REGION || 'us-east-1';

    if (!S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is required when STORAGE_TYPE=s3');
    }

    s3Client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log(`Storage: AWS S3 (Bucket: ${S3_BUCKET_NAME}, Region: ${S3_REGION})`);
  } catch (error) {
    console.error('Failed to initialize S3 client:', error.message);
    console.error('Install AWS SDK: npm install @aws-sdk/client-s3');
    process.exit(1);
  }
} else {
  console.log(`Storage: Local filesystem (${LOCAL_UPLOADS_DIR})`);
}

module.exports = {
  STORAGE_TYPE,

  // Local storage
  LOCAL_UPLOADS_DIR,
  LOCAL_VIDEOS_DIR,
  LOCAL_THUMBNAILS_DIR,

  // S3 storage
  s3Client,
  S3_BUCKET_NAME,
};
