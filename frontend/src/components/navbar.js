import React, { useEffect, useState } from 'react';
import SearchBar from './searchBar';
import LoginButton from './loginButton';
import ThemeToggle from './themeToggle';
import './navbar.css';

function Navbar({ onSearchResults, page, onPageChange, onScrollToResults }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    function refreshUser() {
      const stored = localStorage.getItem('user');
      if (!stored) return setUser(null);
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed && parsed.user_id ? parsed : null);
      } catch (e) {
        setUser(null);
      }
    }
    refreshUser();
    window.addEventListener('userChanged', refreshUser);
    window.addEventListener('storage', refreshUser);
    return () => {
      window.removeEventListener('userChanged', refreshUser);
      window.removeEventListener('storage', refreshUser);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <a href="#home" className="navbar-logo" aria-label="Etusivu">
            {/* Show different logo per theme */}
            <img src="/images/possupohja.png" alt="PossuKino" className="logo logo-default" />
            <img src="/images/possuzorro.png" alt="" className="logo logo-kauhu" aria-hidden="true" />
            <img src="/images/possulapsi.png" alt="" className="logo logo-lapsi" aria-hidden="true" />
            <img src="/images/possurakkaus.png" alt="" className="logo logo-romantiikka" aria-hidden="true" />
          </a>
        </div>

        <SearchBar onSearchResults={onSearchResults} page={page} onPageChange={onPageChange} onScrollToResults={onScrollToResults} />
        
        <ThemeToggle />

        <div className="navbar-links">
          <a href="#movies">Elokuvat</a>
          <a href="#groups">Ryhmät</a>
          {user ? (
            <a href="#profile">Profiili</a>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
