-- Dolapo's Portfolio Database Schema
-- SQLite Database for Development

-- Admin Authentication Table
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,              -- bcrypt hashed
    secret_path TEXT UNIQUE NOT NULL,    -- URL path for admin access
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Videos Metadata Table
-- NOTE: Videos are stored in filesystem or S3, NOT in database
-- This table only stores metadata and file references
CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,                 -- UUID
    title TEXT NOT NULL,
    description TEXT,
    filename TEXT NOT NULL,              -- Original filename
    file_path TEXT NOT NULL,             -- Local path or S3 URL
    thumbnail_path TEXT,                 -- Thumbnail path or S3 URL
    duration INTEGER,                    -- Video duration in seconds
    file_size INTEGER,                   -- File size in bytes
    mime_type TEXT,                      -- video/mp4, video/quicktime, etc.
    category TEXT DEFAULT 'general',     -- commercial, short-film, music-video, etc.
    is_featured BOOLEAN DEFAULT 0,       -- Featured project flag
    view_count INTEGER DEFAULT 0,        -- Analytics: view counter
    storage_type TEXT DEFAULT 'local',   -- 'local' or 's3'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_created ON videos(created_at);

-- Optional: Analytics table for tracking detailed video metrics
CREATE TABLE IF NOT EXISTS video_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT NOT NULL,
    viewer_ip TEXT,                      -- Optional: track unique views
    user_agent TEXT,                     -- Browser/device info
    watched_duration INTEGER,            -- How long they watched (seconds)
    watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Optional: Categories table for better organization
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, description, display_order) VALUES
    ('commercial', 'Commercial and brand work', 1),
    ('short-film', 'Short films and narratives', 2),
    ('music-video', 'Music videos', 3),
    ('documentary', 'Documentary work', 4),
    ('general', 'General projects', 5);
