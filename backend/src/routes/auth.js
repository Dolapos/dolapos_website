const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Verify secret path exists (used by frontend to check if admin panel is accessible)
router.get('/verify-path/:secretPath', (req, res) => {
  const { secretPath } = req.params;

  db.get(
    'SELECT id FROM admin WHERE secret_path = ?',
    [secretPath],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        res.json({ valid: true });
      } else {
        res.status(404).json({ valid: false, error: 'Invalid path' });
      }
    }
  );
});

// Admin login
router.post('/login', async (req, res) => {
  const { username, password, secretPath } = req.body;

  if (!username || !password || !secretPath) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.get(
    'SELECT * FROM admin WHERE username = ? AND secret_path = ?',
    [username, secretPath],
    async (err, admin) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials or secret path' });
      }

      try {
        const validPassword = await bcrypt.compare(password, admin.password);

        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
          { id: admin.id, username: admin.username },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Login successful',
          token,
          admin: {
            id: admin.id,
            username: admin.username
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
      }
    }
  );
});

// Verify token (check if user is still authenticated)
router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, admin: { id: verified.id, username: verified.username } });
  } catch (error) {
    res.status(403).json({ valid: false });
  }
});

module.exports = router;
