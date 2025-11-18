import React from 'react';
import SearchBar from './searchBar';
import LoginButton from './loginButton';
import './navbar.css';

function Navbar({ onSearchResults }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>PossuKino</h1>
        </div>
        
        <div className="navbar-search">
          <SearchBar onSearchResults={onSearchResults} />
        </div>
        
        <div className="navbar-links">
          {/* Tähän tulee myöhemmin navigaatiolinkit */}
          <a href="#home">Etusivu</a>
          <a href="#movies">Elokuvat</a>
          <a href="#groups">Ryhmät</a>
          <a href="#profile">Profiili</a>
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
