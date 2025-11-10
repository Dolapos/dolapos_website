const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/videos');
const thumbnailsDir = path.join(__dirname, '../../uploads/thumbnails');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, uploadsDir);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, thumbnailsDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for videos
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'video') {
      const videoTypes = /mp4|mov|avi|wmv|flv|webm|mkv/;
      const extname = videoTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = videoTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only video files are allowed!'));
      }
    } else if (file.fieldname === 'thumbnail') {
      const imageTypes = /jpeg|jpg|png|gif|webp/;
      const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = imageTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for thumbnails!'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Get all videos (public endpoint)
router.get('/', (req, res) => {
  const query = 'SELECT * FROM videos ORDER BY created_at DESC';

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ videos: rows });
  });
});

// Get single video (public endpoint)
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM videos WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment view count
    db.run('UPDATE videos SET view_count = view_count + 1 WHERE id = ?', [id]);

    res.json({ video: row });
  });
});

// Upload new video (protected endpoint)
router.post('/upload', authenticateToken, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), (req, res) => {
  const { title, description, category, is_featured } = req.body;
  const videoFile = req.files['video'] ? req.files['video'][0] : null;
  const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

  if (!videoFile) {
    return res.status(400).json({ error: 'Video file is required' });
  }

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const videoId = uuidv4();
  const videoPath = `/uploads/videos/${videoFile.filename}`;
  const thumbnailPath = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : null;

  const query = `
    INSERT INTO videos (id, title, description, filename, file_path, thumbnail_path, file_size, category, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      videoId,
      title,
      description || '',
      videoFile.originalname,
      videoPath,
      thumbnailPath,
      videoFile.size,
      category || 'general',
      is_featured === 'true' ? 1 : 0
    ],
    function (err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save video metadata' });
      }

      res.status(201).json({
        message: 'Video uploaded successfully',
        video: {
          id: videoId,
          title,
          description,
          file_path: videoPath,
          thumbnail_path: thumbnailPath
        }
      });
    }
  );
});

// Update video metadata (protected endpoint)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, category, is_featured } = req.body;

  const query = `
    UPDATE videos
    SET title = ?, description = ?, category = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    query,
    [title, description, category, is_featured ? 1 : 0, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.json({ message: 'Video updated successfully' });
    }
  );
});

// Delete video (protected endpoint)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // First get the video to delete the files
  db.get('SELECT * FROM videos WHERE id = ?', [id], (err, video) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete the video file
    const videoFilePath = path.join(__dirname, '../..', video.file_path);
    if (fs.existsSync(videoFilePath)) {
      fs.unlinkSync(videoFilePath);
    }

    // Delete the thumbnail if exists
    if (video.thumbnail_path) {
      const thumbnailFilePath = path.join(__dirname, '../..', video.thumbnail_path);
      if (fs.existsSync(thumbnailFilePath)) {
        fs.unlinkSync(thumbnailFilePath);
      }
    }

    // Delete from database
    db.run('DELETE FROM videos WHERE id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete video' });
      }

      res.json({ message: 'Video deleted successfully' });
    });
  });
});

module.exports = router;
