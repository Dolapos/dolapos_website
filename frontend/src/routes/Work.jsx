import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Portfolio/Header';
import Footer from '../components/Portfolio/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Work() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/videos`);

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(videos.map(v => v.category))];

  const filteredVideos = selectedCategory === 'all'
    ? videos
    : videos.filter(v => v.category === selectedCategory);

  return (
    <div className="portfolio-container">
      <Header />

      <section className="projects">
        <div className="container">
          <h1 className="section-title">PORTFOLIO</h1>
          <p className="section-subtitle">
            A collection of my creative work in cinematography and video editing
          </p>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="category-filter">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="loading">
              <p>Loading videos...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>Error loading videos: {error}</p>
              <button onClick={fetchVideos} className="retry-btn">Retry</button>
            </div>
          )}

          {!loading && !error && filteredVideos.length === 0 && (
            <div className="no-videos">
              <p>No videos available yet. Check back soon!</p>
            </div>
          )}

          {!loading && !error && filteredVideos.length > 0 && (
            <div className="projects-grid">
              {filteredVideos.map((video) => (
                <Link
                  to={`/work/${video.id}`}
                  key={video.id}
                  className="project-card"
                >
                  <div className="project-thumbnail">
                    {video.thumbnail_path ? (
                      <img
                        src={`http://localhost:5000${video.thumbnail_path}`}
                        alt={video.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="thumbnail-placeholder"
                      style={{ display: video.thumbnail_path ? 'none' : 'flex' }}
                    >
                      <span>🎬</span>
                    </div>
                    <div className="project-overlay">
                      <h3>{video.title}</h3>
                      {video.description && (
                        <p>{video.description.substring(0, 100)}{video.description.length > 100 ? '...' : ''}</p>
                      )}
                      {video.is_featured && (
                        <span className="featured-badge">Featured</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Work;
