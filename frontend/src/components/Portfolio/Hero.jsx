import React, { useState, useEffect } from 'react';

export default function Hero() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'CREATIVE\nEDITOR &\nCINEMATOGRAPHER';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 80); // Speed of typing (80ms per character)

      return () => clearTimeout(timeout);
    } else {
      // Hide cursor after typing completes
      const hideCursorTimeout = setTimeout(() => {
        setShowCursor(false);
      }, 1000);
      return () => clearTimeout(hideCursorTimeout);
    }
  }, [currentIndex]);

  return (
    <section className="hero">
      <div className="hero-container">
        <h2 className="typewriter-text">
          {displayedText.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < displayedText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
          {showCursor && <span className="cursor">|</span>}
        </h2>
        <p>
          Crafting stories that merge faith and art by using film as a medium to inspire authenticity and purpose
        </p>
        <p>
          Based in Delaware.
        </p>
      </div>
    </section>
  );
}
