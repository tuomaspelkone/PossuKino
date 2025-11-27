import './movieDetail.css';
import React, { useEffect, useState } from 'react';

function MovieDetail({ movieId }) {
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favSuccess, setFavSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  async function handleAddFavorite() {
    if (isFavorite) return; // Estä turha lisäys jos jo suosikeissa
    try {
      setFavSuccess(false);
      const stored = localStorage.getItem('user');
      if (!stored) throw new Error('Kirjaudu sisään lisätäksesi suosikkeihin');
      const user = JSON.parse(stored);
      if (!user.user_id) throw new Error('Käyttäjätunnus puuttuu');
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const res = await fetch(`${apiBaseNoSlash}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, tmdb_id: movieId })
      });
      console.log('Favorites POST status', res.status);
      console.log('Favorites POST headers', [...res.headers.entries()]);
      if (!res.ok) {
        let serverMsg = 'Lisäys epäonnistui';
        try {
          const errBody = await res.json();
          if (errBody && (errBody.error || errBody.message)) {
            serverMsg = errBody.error || errBody.message;
          }
        } catch {}
        throw new Error(serverMsg);
      }
      setFavSuccess(true);
      setIsFavorite(true);
      setTimeout(() => setFavSuccess(false), 2000);
    } catch (err) {
      setFavSuccess(false);
      alert(err.message || 'Lisäys epäonnistui');
    }
  }

  useEffect(() => {
    async function fetchMovieData() {
      try {
        setLoading(true);
        setError(null);

        // Hae elokuvan tiedot TMDB:stä
        const movieRes = await fetch(`${apiBase}/tmdb/movie/${movieId}`);
        if (!movieRes.ok) throw new Error('Elokuvaa ei löytynyt');
        const movieData = await movieRes.json();
        setMovie(movieData);

        // Hae arvostelut (jos on olemassa)
        const reviewsRes = await fetch(`${apiBase}/reviews`);
        if (reviewsRes.ok) {
          const allReviews = await reviewsRes.json();
          const movieReviews = allReviews.filter(r => 
            Number(r.movie_id || r.tmdb_id) === Number(movieId)
          );
          setReviews(movieReviews);
        }

        // Genret tulevat suoraan TMDB-datasta
        if (movieData.genres) {
          setGenres(movieData.genres);
        }

        // Tarkista onko jo suosikeissa (jos käyttäjä kirjautunut)
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const user = JSON.parse(stored);
            if (user && user.user_id) {
              const favRes = await fetch(`${apiBase}/favorites`);
              if (favRes.ok) {
                const allFavs = await favRes.json();
                const already = allFavs.some(f => Number(f.tmdb_id) === Number(movieId) && Number(f.user_id) === Number(user.user_id));
                setIsFavorite(already);
              }
            }
          } catch {}
        }

      } catch (err) {
        setError(err.message || 'Virhe ladattaessa elokuvaa');
      } finally {
        setLoading(false);
      }
    }

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId, apiBase]);

  if (loading) {
    return (
      <div className="movie-detail-container">
        <div className="loading">Ladataan elokuvaa...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-detail-container">
        <div className="error">{error}</div>
        <button onClick={() => {
          const ret = sessionStorage.getItem('returnToGroup');
          if (ret) {
            // Do not remove here; GroupPage will consume and remove it after loading
            window.location.hash = '#groups';
          } else {
            window.location.hash = '#home';
          }
        }}>
          ← Takaisin
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail-container">
        <div className="error">Elokuvaa ei löytynyt</div>
      </div>
    );
  }

  return (
    <div className="movie-detail-container">
      <button className="back-button" onClick={() => {
        const ret = sessionStorage.getItem('returnToGroup');
        if (ret) {
          // Do not remove here; GroupPage will consume and remove it after loading
          window.location.hash = '#groups';
        } else {
          window.location.hash = '#home';
        }
      }}>
        ← Takaisin
      </button>

      <div className="movie-detail-content">
        {/* Elokuvan kuva */}
        <div className="movie-poster-large">
          {movie.movie_image || movie.poster_path ? (
            <img 
              src={movie.movie_image || `https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.movie_title || movie.title} 
            />
          ) : (
            <div className="no-poster-large">Ei kuvaa</div>
          )}
        </div>

        {/* Elokuvan tiedot */}
        <div className="movie-info-section">
          <h1>{movie.movie_title || movie.title}</h1>
          
          {movie.tagline && (
            <p className="tagline">"{movie.tagline}"</p>
          )}

          <div className="movie-meta">
            {movie.release_date && (
              <span className="meta-item">📅 {movie.release_date}</span>
            )}
            {movie.runtime && (
              <span className="meta-item">⏱️ {movie.runtime} min</span>
            )}
            {movie.vote_average && (
              <span className="meta-item">⭐ {movie.vote_average}/10</span>
            )}
            {movie.movie_certification && (
              <span className="meta-item">📋 {movie.movie_certification}</span>
            )}
          </div>

          {/* Genret */}
          {genres && genres.length > 0 && (
            <div className="genres-section">
              <h3>Genret</h3>
              <div className="genres-list">
                {genres.map(genre => (
                  <span key={genre.id || genre.genre_id} className="genre-tag">
                    {genre.name || genre.genre_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Kuvaus */}
          {(movie.movie_description || movie.overview) && (
            <div className="description-section">
              <h3>Kuvaus</h3>
              <p>{movie.movie_description || movie.overview}</p>
            </div>
          )}

          {/* Arvostelut */}
          <div className="reviews-section">
            <h3>Arvostelut ({reviews.length})</h3>
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.review_id} className="review-card">
                    <div className="review-rating">⭐ {review.rating}/5</div>
                    <p className="review-text">{review.review_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-reviews">Ei vielä arvosteluja</p>
            )}
          </div>
        </div>
      </div>
      {/* Kelluva suosikkinappi sivun oikeassa alakulmassa */}
      <button
        className={`favorite-float-btn${isFavorite ? ' favorite-in-list' : ''}`}
        onClick={handleAddFavorite}
        disabled={favSuccess || isFavorite}
        aria-disabled={favSuccess || isFavorite}
        title={isFavorite ? 'Elokuva on jo suosikeissa' : 'Lisää elokuva suosikkeihin'}
      >
        {isFavorite ? '❤️ Suosikeissa' : '❤️ Lisää suosikiksi'}
      </button>
      {favSuccess && (
        <div className="favorite-success-toast" aria-live="polite">Lisäys onnistui</div>
      )}
    </div>
  );
}

export default MovieDetail;
