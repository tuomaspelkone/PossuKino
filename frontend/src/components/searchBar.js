import React, { useState, useEffect } from 'react';
import './searchBar.css';

function SearchBar({ onSearchResults, page = 1, onPageChange }) {
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

  // Re-run search when page changes (coming from parent pagination)
  useEffect(() => {
    // Only trigger when searching movies with existing results
    if (searchType === 'movies' && searchResultsLocal.length > 0) {
      performSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:3001/tmdb/genres');
      const data = await response.json();
      // TMDB returns [{id, name}, ...]
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
        url = 'http://localhost:3001/tmdb/search';
        if (searchTerm) params.append('q', searchTerm);
        if (selectedGenres.length > 0) params.append('genres', selectedGenres.join(','));
        if (selectedCertification) params.append('certification', selectedCertification);
        // page is controlled by parent (App) via props; include it here
        params.append('page', page || 1);
      } else {
        url = 'http://localhost:3001/group/search';
        if (searchTerm) params.append('q', searchTerm);
      }

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      
      // Handle different response formats
      let mapped = [];
      if (searchType === 'movies') {
        // TMDB proxy returns { results, page, total_pages }
        mapped = Array.isArray(data.results) ? data.results : [];
      } else {
        // Groups returns array directly
        mapped = Array.isArray(data) ? data : [];
      }
      
      // Rajaa dropdownissa näytettävät tulokset ensimmäisiin 10:een
      setSearchResultsLocal(mapped.slice(0, 10));
      // Call parent with structured payload so App can paginate
      onSearchResults && onSearchResults({ results: mapped, page: data.page || 1, total_pages: data.total_pages || 1 });
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = async () => {
    await performSearch();
    setIsOpen(false);
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
    <div className="search-bar-container">
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

          {/* Hae-nappi */}
          <button 
            className="search-button"
            onClick={handleSearchClick}
            disabled={!searchTerm && selectedGenres.length === 0 && !selectedCertification}
          >
            Hae
          </button>

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
                      <label key={genre.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre.id)}
                          onChange={() => handleGenreToggle(genre.id)}
                        />
                        {genre.name}
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
          
          </div>
        )}
      </div>

      {/* Hakutulokset dropdownin vieressä */}
      {isOpen && searchResultsLocal && searchResultsLocal.length > 0 && (
        <div className="search-results-panel">
          <h4>Tulokset ({searchResultsLocal.length})</h4>
          <ul>
            {searchResultsLocal.map(item => (
              <li key={item.movie_id || item.tmdb_id || item.group_id}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.tmdb_id || item.movie_id) {
                      window.location.hash = `#movie/${item.tmdb_id || item.movie_id}`;
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className="result-item">
                    <strong>{item.movie_title || item.group_name}</strong>
                    {item.movie_year && <span className="year"> ({item.movie_year})</span>}
                    {item.movie_description && (
                      <p className="description">{item.movie_description.substring(0, 100)}...</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchBar;