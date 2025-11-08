import React from 'react';
import { Link } from 'react-router-dom';


export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/">
          <img
            src="/logo.png"
            alt="Your Name Logo"
            className="logo"
          />
        </Link>
        <nav>
          <Link to="/work">PORTFOLIO</Link>
          <Link to="/about">ABOUT</Link>
          <Link to="/contact">CONTACT</Link>
        </nav>
      </div>
    </header>
  );
}
