import React, { useEffect, useState } from 'react';
import SearchBar from './searchBar';
import LoginButton from './loginButton';
import './navbar.css';

function Navbar({ onSearchResults, page, onPageChange }) {
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
          <h1>PossuKino</h1>
        </div>
        
        <div className="navbar-search">
          <SearchBar onSearchResults={onSearchResults} page={page} onPageChange={onPageChange} />
        </div>
        
        <div className="navbar-links">
          {/* Navigation links */}
          <a href="#home">Etusivu</a>
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
