const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, S3_BUCKET_NAME } = require('../config/storage');
const fs = require('fs');

/**
 * Upload a file to S3
 * @param {string} filePath - Local file path
 * @param {string} s3Key - S3 object key (path in bucket)
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - S3 URL
 */
async function uploadToS3(filePath, s3Key, contentType) {
  try {
    const fileContent = fs.readFileSync(filePath);

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      // Make videos publicly accessible (or use presigned URLs for private access)
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Return the S3 URL
    const s3Url = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

    // Delete local file after successful upload
    fs.unlinkSync(filePath);

    return s3Url;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

/**
 * Delete a file from S3
 * @param {string} s3Key - S3 object key
 */
async function deleteFromS3(s3Key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);
    console.log(`Deleted from S3: ${s3Key}`);
  } catch (error) {
    console.error('S3 deletion error:', error);
    throw new Error(`Failed to delete from S3: ${error.message}`);
  }
}

/**
 * Generate a presigned URL for private video access
 * @param {string} s3Key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns {Promise<string>} - Presigned URL
 */
async function getPresignedUrl(s3Key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Presigned URL error:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

/**
 * Extract S3 key from full S3 URL
 * @param {string} s3Url - Full S3 URL
 * @returns {string} - S3 key
 */
function extractS3Key(s3Url) {
  if (!s3Url) return null;

  // Extract key from URL formats:
  // https://bucket-name.s3.amazonaws.com/path/to/file.mp4
  // https://bucket-name.s3.region.amazonaws.com/path/to/file.mp4
  const match = s3Url.match(/amazonaws\.com\/(.+)$/);
  return match ? match[1] : null;
}

module.exports = {
  uploadToS3,
  deleteFromS3,
  getPresignedUrl,
  extractS3Key,
};
