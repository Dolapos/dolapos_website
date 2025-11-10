import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Portfolio/Header';
import Footer from '../components/Portfolio/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/videos/${id}`);

      if (!response.ok) {
        throw new Error('Video not found');
      }

      const data = await response.json();
      setVideo(data.video);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="portfolio-container">
        <Header />
        <section className="project-detail">
          <div className="container">
            <p>Loading video...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="portfolio-container">
        <Header />
        <section className="project-detail">
          <div className="container">
            <h1>Video Not Found</h1>
            <p>{error || 'The requested video could not be found.'}</p>
            <Link to="/work" className="back-link">← Back to Portfolio</Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <Header />

      <section className="project-detail">
        <div className="container">
          <Link to="/work" className="back-link">← Back to Portfolio</Link>

          <div className="project-detail-header">
            <h1>{video.title}</h1>
            {video.category && (
              <span className="project-category">{video.category.toUpperCase()}</span>
            )}
          </div>

          <div className="project-video-container">
            <video
              controls
              autoPlay={false}
              className="project-video"
              poster={video.thumbnail_path ? `http://localhost:5000${video.thumbnail_path}` : undefined}
            >
              <source src={`http://localhost:5000${video.file_path}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {video.description && (
            <div className="project-description">
              <h2>About This Project</h2>
              <p>{video.description}</p>
            </div>
          )}

          <div className="project-meta">
            <div className="meta-item">
              <span className="meta-label">Views:</span>
              <span className="meta-value">{video.view_count || 0}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Published:</span>
              <span className="meta-value">
                {new Date(video.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            {video.file_size && (
              <div className="meta-item">
                <span className="meta-label">File Size:</span>
                <span className="meta-value">
                  {(video.file_size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default VideoDetail;
