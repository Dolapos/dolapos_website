-- Dolapo's Portfolio Database Schema
-- PostgreSQL Database for Production (Railway)

-- Admin Authentication Table
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,              -- bcrypt hashed
    secret_path VARCHAR(255) UNIQUE NOT NULL,    -- URL path for admin access
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos Metadata Table
-- NOTE: Videos are stored in S3, NOT in database
-- This table only stores metadata and file references
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(36) PRIMARY KEY,                  -- UUID
    title TEXT NOT NULL,
    description TEXT,
    filename TEXT NOT NULL,                      -- Original filename
    file_path TEXT NOT NULL,                     -- S3 URL
    thumbnail_path TEXT,                         -- Thumbnail S3 URL
    duration INTEGER,                            -- Video duration in seconds
    file_size BIGINT,                            -- File size in bytes
    mime_type VARCHAR(100),                      -- video/mp4, video/quicktime, etc.
    category VARCHAR(100) DEFAULT 'general',     -- commercial, short-film, music-video, etc.
    is_featured BOOLEAN DEFAULT FALSE,           -- Featured project flag
    view_count INTEGER DEFAULT 0,                -- Analytics: view counter
    storage_type VARCHAR(20) DEFAULT 's3',       -- 's3' for production
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_created ON videos(created_at);

-- Analytics table for tracking detailed video metrics
CREATE TABLE IF NOT EXISTS video_analytics (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(36) NOT NULL,
    viewer_ip VARCHAR(45),                       -- IPv4 or IPv6
    user_agent TEXT,                             -- Browser/device info
    watched_duration INTEGER,                    -- How long they watched (seconds)
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Categories table for better organization
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories (PostgreSQL syntax)
INSERT INTO categories (name, description, display_order)
VALUES
    ('commercial', 'Commercial and brand work', 1),
    ('short-film', 'Short films and narratives', 2),
    ('music-video', 'Music videos', 3),
    ('documentary', 'Documentary work', 4),
    ('general', 'General projects', 5)
ON CONFLICT (name) DO NOTHING;
