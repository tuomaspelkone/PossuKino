import React, { useState, useEffect } from 'react';
import './searchBar.css';

function SearchBar({ onSearchResults }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('movies'); // 'movies' tai 'groups'
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState('');
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResultsLocal, setSearchResultsLocal] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  // Hae genret komponentin latautuessa
  useEffect(() => {
    fetchGenres();
  }, []);

  // Debounced search - odottaa 300ms ennen haun suorittamista
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || selectedGenres.length > 0 || selectedCertification) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenres, selectedCertification, searchType]);

  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:3001/genres');
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      let url = '';
      const params = new URLSearchParams();

      if (searchType === 'movies') {
        url = 'http://localhost:3001/movies/search';
        if (searchTerm) params.append('q', searchTerm);
        if (selectedGenres.length > 0) params.append('genres', selectedGenres.join(','));
        if (selectedCertification) params.append('certification', selectedCertification);
      } else {
        url = 'http://localhost:3001/groups/search';
        if (searchTerm) params.append('q', searchTerm);
      }

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      // Rajaa dropdownissa näytettävät tulokset ensimmäisiin 10:een
      setSearchResultsLocal(Array.isArray(data) ? data.slice(0, 10) : []);
      onSearchResults && onSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenres([]);
    setSelectedCertification('');
    setSearchResultsLocal([]);
  };

  return (
    <div className="search-bar">
      {/* Hakuikoni - klikkaamalla avautuu dropdown */}
      <button 
        className="search-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Avaa haku"
      >
        🔍
      </button>

      {/* Dropdown-sisältö */}
      {isOpen && (
        <div className="search-dropdown">
          <div className="search-header">
            <h3>Haku</h3>
            <button 
              className="close-btn" 
              onClick={() => setIsOpen(false)}
              aria-label="Sulje haku"
            >
              ✕
            </button>
          </div>
          
          {/* Hae elokuvia tai ryhmiä */}
          <div className="search-type-toggle">
            <button
              className={searchType === 'movies' ? 'active' : ''}
              onClick={() => setSearchType('movies')}
            >
              Elokuvat
            </button>
            <button
              className={searchType === 'groups' ? 'active' : ''}
              onClick={() => setSearchType('groups')}
            >
              Ryhmät
            </button>
          </div>

          {/* Hakukenttä */}
          <div className="search-input-container">
            <input
              type="text"
              placeholder={searchType === 'movies' ? 'Hae elokuvia...' : 'Hae ryhmiä...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
            {loading && <span className="loading-spinner">🔄</span>}
          </div>

          {/* Suodattimet - näytetään vain elokuvahaussa */}
          {searchType === 'movies' && (
            <div className="filters">
              {/* Genre-suodatin */}
              <div className="filter-group">
                <button 
                  className="genre-toggle-btn"
                  onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                  type="button"
                >
                  Genret {showGenreDropdown ? '▲' : '▼'}
                  {selectedGenres.length > 0 && ` (${selectedGenres.length} valittu)`}
                </button>
                
                {showGenreDropdown && (
                  <div className="genre-checkboxes">
                    {genres.map(genre => (
                      <label key={genre.genre_id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre.genre_id)}
                          onChange={() => handleGenreToggle(genre.genre_id)}
                        />
                        {genre.genre_name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Ikäraja-suodatin */}
              <div className="filter-group">
                <label>Ikäraja:</label>
                <select
                  value={selectedCertification}
                  onChange={(e) => setSelectedCertification(e.target.value)}
                  className="certification-select"
                >
                  <option value="">Kaikki</option>
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="NC-17">NC-17</option>
                </select>
              </div>

              {/* Tyhjennä suodattimet */}
              {(searchTerm || selectedGenres.length > 0 || selectedCertification) && (
                <button onClick={clearFilters} className="clear-button">
                  Tyhjennä suodattimet
                </button>
              )}
            </div>
          )}
          
          {/* Hakutulokset listana (rajoitettu slice(0,10)) */}
          {searchResultsLocal && searchResultsLocal.length > 0 && (
            <div className="search-results-dropdown">
              <ul>
                {searchResultsLocal.map(item => (
                  <li key={item.movie_id || item.group_id} className="search-result-item">
                    <button
                      type="button"
                      onClick={() => {
                        // Sulje dropdown; tarvittaessa lisää navigointi tähän
                        setIsOpen(false);
                      }}
                    >
                      {item.movie_title || item.group_name}
                      {item.movie_year ? ` (${item.movie_year})` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;