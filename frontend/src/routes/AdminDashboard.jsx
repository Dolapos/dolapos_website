import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const { secretPath } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    is_featured: false
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate(`/admin/${secretPath}`);
      return;
    }

    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/videos`);
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleVideoFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleThumbnailFileChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!formData.title) {
      setError('Please enter a title');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate(`/admin/${secretPath}`);
      return;
    }

    const uploadData = new FormData();
    uploadData.append('video', videoFile);
    if (thumbnailFile) {
      uploadData.append('thumbnail', thumbnailFile);
    }
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('category', formData.category);
    uploadData.append('is_featured', formData.is_featured);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await fetch(`${API_URL}/videos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess('Video uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        category: 'general',
        is_featured: false
      });
      setVideoFile(null);
      setThumbnailFile(null);

      // Reset file inputs
      document.getElementById('videoFile').value = '';
      document.getElementById('thumbnailFile').value = '';

      // Refresh videos list
      fetchVideos();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`${API_URL}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      setSuccess('Video deleted successfully!');
      fetchVideos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate(`/admin/${secretPath}`);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="dashboard-container">
        {/* Upload Section */}
        <section className="upload-section">
          <h2>Upload New Video</h2>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {success && (
            <div className="success-banner">
              {success}
            </div>
          )}

          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                disabled={uploading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., commercial, short-film, music-video"
                  disabled={uploading}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    disabled={uploading}
                  />
                  Featured Project
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="videoFile">Video File * (MP4, MOV, etc.)</label>
              <input
                type="file"
                id="videoFile"
                accept="video/*"
                onChange={handleVideoFileChange}
                required
                disabled={uploading}
              />
              {videoFile && (
                <p className="file-info">Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="thumbnailFile">Thumbnail Image (Optional)</label>
              <input
                type="file"
                id="thumbnailFile"
                accept="image/*"
                onChange={handleThumbnailFileChange}
                disabled={uploading}
              />
              {thumbnailFile && (
                <p className="file-info">Selected: {thumbnailFile.name}</p>
              )}
            </div>

            <button
              type="submit"
              className="upload-btn"
              disabled={uploading}
            >
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
            </button>
          </form>
        </section>

        {/* Videos List */}
        <section className="videos-list-section">
          <h2>Uploaded Videos ({videos.length})</h2>

          {videos.length === 0 ? (
            <p className="no-videos">No videos uploaded yet.</p>
          ) : (
            <div className="videos-grid">
              {videos.map((video) => (
                <div key={video.id} className="video-item">
                  <div className="video-thumbnail">
                    {video.thumbnail_path ? (
                      <img
                        src={`http://localhost:5000${video.thumbnail_path}`}
                        alt={video.title}
                      />
                    ) : (
                      <div className="thumbnail-placeholder">🎬</div>
                    )}
                    {video.is_featured && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>

                  <div className="video-info">
                    <h3>{video.title}</h3>
                    <p className="video-category">{video.category}</p>
                    <p className="video-stats">
                      Views: {video.view_count || 0} |
                      {video.file_size && ` Size: ${(video.file_size / (1024 * 1024)).toFixed(2)} MB`}
                    </p>
                    <p className="video-date">
                      {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="video-actions">
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
