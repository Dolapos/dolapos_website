import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminLogin() {
  const { secretPath } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validPath, setValidPath] = useState(false);
  const [checkingPath, setCheckingPath] = useState(true);

  useEffect(() => {
    // Verify the secret path exists
    verifySecretPath();
  }, [secretPath]);

  const verifySecretPath = async () => {
    try {
      setCheckingPath(true);
      const response = await fetch(`${API_URL}/auth/verify-path/${secretPath}`);
      const data = await response.json();

      if (data.valid) {
        setValidPath(true);
      } else {
        setValidPath(false);
        setError('Invalid admin path');
      }
    } catch (err) {
      setValidPath(false);
      setError('Unable to verify admin path');
    } finally {
      setCheckingPath(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          secretPath
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));

      // Redirect to admin dashboard
      navigate(`/admin/${secretPath}/dashboard`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingPath) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <p>Verifying...</p>
        </div>
      </div>
    );
  }

  if (!validPath) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h1>404</h1>
          <p>Page not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <h1>Admin Access</h1>
          <p>Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <Link to="/" className="back-to-home">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AdminLogin;
