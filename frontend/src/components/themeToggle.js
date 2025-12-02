import React, { useState, useEffect, useRef } from 'react';
import './themeToggle.css';

function ThemeToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('pink');
  const dropdownRef = useRef(null);

  const themes = [
    { id: 'pink', name: 'PossuKino (Roosa)', color: '#AE5969', emoji: '🐷' },
    { id: 'kauhu', name: 'Kauhu', color: '#AA4472', emoji: '💀' },
    { id: 'lapsi', name: 'Lapsi', color: '#ffb3ba', emoji: '🧸' },
    { id: 'romantiikka', name: 'Romantiikka', color: '#ab3f60', emoji: '🌹' }
  ];

  useEffect(() => {
    // Lataa tallennettu teema
    const saved = localStorage.getItem('possukinoTheme') || 'pink';
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const applyTheme = (themeId) => {
    if (themeId === 'pink') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeId);
    }
  };

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('possukinoTheme', themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className="theme-toggle-container" ref={dropdownRef}>
      <button 
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Vaihda teema"
      >
        <span className="theme-icon" style={{ backgroundColor: currentThemeData.color }}>🎨</span>
      </button>
      
      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-dropdown-header">
            <h4>Valitse teema</h4>
          </div>
          <div className="theme-list">
            {themes.map(theme => (
              <button
                key={theme.id}
                className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <span className="theme-emoji">{theme.emoji}</span>
                {currentTheme === theme.id && <span className="checkmark">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
