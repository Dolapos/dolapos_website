import React from 'react';
import { Link, useLocation } from 'react-router-dom';


export default function Header() {
  const location = useLocation();

  // Determine active link based on current path
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="header">
      <div className="header-container-grid">
        {/* Left: Logo */}
        <div className="header-left">
          <Link to="/" className="logo-text">
            DOLAPS
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="header-nav-center">
          <Link
            to="/work"
            className={isActive('/work') ? 'nav-link active' : 'nav-link'}
          >
            PORTFOLIO
          </Link>
          <Link
            to="/about"
            className={isActive('/about') ? 'nav-link active' : 'nav-link'}
          >
            ABOUT
          </Link>
          <Link
            to="/contact"
            className={isActive('/contact') ? 'nav-link active' : 'nav-link'}
          >
            CONTACT
          </Link>
        </nav>

        {/* Right: Empty spacer for balance */}
        <div className="header-right"></div>
      </div>
    </header>
  );
}
