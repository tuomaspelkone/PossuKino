import React, { useEffect, useState } from "react";
import "./movieShowcase.css";

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
      // Kutsu backendiin välimuistin kautta
      const response = await fetch("http://localhost:3001/cache/popular");
      
      if (!response.ok) {
        throw new Error(`HTTP-virhe: ${response.status}`);
      }
      
      const data = await response.json();
      setMovies(data);
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
      <h2>📽️ Elokuvat tietokannasta</h2>
      <div className="movies-grid">
        {movies.map(movie => (
          <div key={movie.movie_id} className="movie-card">
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