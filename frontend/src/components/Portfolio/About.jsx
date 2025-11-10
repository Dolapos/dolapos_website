import React from 'react';


export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-container">
        <h1 className="section-title">ABOUT</h1>
        <p className="section-subtitle">
          Filmmaker & Storyteller
        </p>

        <div className="about-content">
          {/* Left side - Image and Social Icons */}
          <div className="about-left">
            <div className="about-image">
              <img src="/headshot.jpg" alt="Dolapo Ogunsola" />
            </div>
            <div className="about-social-icons">
              <a href="https://www.instagram.com/dolapsfilm/" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@dolapshaps" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/dolapo-ogunsola/" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>


          {/* Right side - Bio Text */}
          <div className="about-right">
            <p>
              Dolapo Ogunsola is a cinematographer based in Delaware.
            </p>
            <p>
              He is passionate about capturing real stories through his lens, focusing on authentic human experiences that resonate deeply with audiences.
            </p>
            <p>
              His work blends emotional depth and creativity, aiming to inspire and evoke genuine connections.
            </p>
            <p>
              In the future, Dolapo aims to expand his portfolio through storytelling that merges faith, culture, and art—using film as a medium to inspire authenticity and purpose in a modern world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
