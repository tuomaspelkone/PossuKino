import React, { useEffect, useState } from "react";
import "./movieShowcase.css";

// Use API base from env so it works outside localhost
const apiBase = process.env.REACT_APP_API_URL || "http://localhost:3001";

function MovieShowcase() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  const fetchPopularMovies = async () => {
    try {
      setLoading(true);
      // Kutsu TMDB API:ta suoraan täydellä elokuvadatalla
      const response = await fetch(`${apiBase}/tmdb/popular`);
      
      if (!response.ok) {
        throw new Error(`HTTP-virhe: ${response.status}`);
      }
      
      const data = await response.json();
      setMovies(data.results || []);
      setError(null);
    } catch (error) {
      console.error("Virhe:", error);
      setError(error.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="movie-showcase">
        <div className="loading">⏳ Ladataan elokuvia...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-showcase">
        <div className="error">❌ Virhe: {error}</div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="movie-showcase">
        <div className="error">Ei elokuvia saatavilla</div>
      </div>
    );
  }

  return (
    <div className="movie-showcase">
      <h2>📽️ Uusimmat elokuvat</h2>
      <div className="movies-grid">
        {movies.map(movie => (
          <div 
            key={movie.tmdb_id} 
            className="movie-card"
            onClick={() => { try { sessionStorage.setItem('returnTo', '#home'); } catch(e){} window.location.hash = `#movie/${movie.tmdb_id}`; }}
            style={{ cursor: 'pointer' }}
          >
            <div className="movie-poster">
              {movie.movie_image ? (
                <img 
                  src={movie.movie_image}
                  alt={movie.movie_title}
                  onError={(e) => e.target.style.display = 'none'}
                />
              ) : (
                <div className="no-poster">Ei kuvaa</div>
              )}
            </div>
            <div className="movie-info">
              <h3>{movie.movie_title}</h3>
              {movie.movie_certification && (
                <p className="certification">📋 {movie.movie_certification}</p>
              )}
              {movie.movie_description && (
                <p className="description">
                  {movie.movie_description.substring(0, 100)}...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieShowcase;