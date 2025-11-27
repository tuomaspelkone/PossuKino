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

  // Group picker state for choosing which group to add the movie to
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [groupPickerLoading, setGroupPickerLoading] = useState(false);
  const [groupPickerError, setGroupPickerError] = useState(null);
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

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

  // Add movie to selected group (called from group picker)
  async function handleAddToGroup(group_id) {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) { window.alert('Kirjaudu sisään lisätäksesi ryhmään.'); return; }
      const parsed = JSON.parse(stored);
      if (!parsed || !parsed.user_id) { window.alert('Kirjaudu sisään lisätäksesi ryhmään.'); return; }

      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const payload = {
        group_id: Number(group_id),
        tmdb_id: Number(movieId),
        movie_title: movie.movie_title || movie.title,
        movie_image: movie.movie_image || movie.poster_path || null,
        movie_description: movie.movie_description || movie.overview || ''
      };
      const addRes = await fetch(`${apiBaseNoSlash}/group_movies`, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!addRes.ok) {
        const txt = await addRes.text();
        throw new Error('HTTP ' + addRes.status + ': ' + txt);
      }
      window.alert('Elokuva lisätty ryhmään.');
      setShowGroupPicker(false);
    } catch (err) {
      console.error('Lisää ryhmään epäonnistui', err);
      window.alert('Lisää ryhmään epäonnistui: ' + (err.message || 'virhe'));
    }
  }

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
          <div className="movie-action-buttons">
            <button className="btn add-group-btn" onClick={async () => {
              try {
                const stored = localStorage.getItem('user');
                if (!stored) { window.alert('Kirjaudu sisään lisätäksesi ryhmään.'); return; }
                const parsed = JSON.parse(stored);
                if (!parsed || !parsed.user_id) { window.alert('Kirjaudu sisään lisätäksesi ryhmään.'); return; }
                const apiBaseNoSlash = apiBase.replace(/\/$/, '');

                setGroupPickerLoading(true);
                setGroupPickerError(null);

                // Haetaan ryhmät ja jäsenyydet ja suodatetaan käyttäjän jäsenyyksiin
                const [resGroups, resMembers] = await Promise.all([fetch(`${apiBaseNoSlash}/group`), fetch(`${apiBaseNoSlash}/group_members`)]);
                if (!resGroups.ok || !resMembers.ok) throw new Error('Ryhmien hakeminen epäonnistui');
                const groupsData = await resGroups.json();
                const membersData = await resMembers.json();
                const myGroupIds = (Array.isArray(membersData) ? membersData : []).filter(m => Number(m.user_id) === Number(parsed.user_id)).map(m => Number(m.group_id));
                const groups = (Array.isArray(groupsData) ? groupsData : []).filter(g => myGroupIds.includes(Number(g.group_id)));

                if (!groups || groups.length === 0) {
                  if (window.confirm('Et ole jäsenenä missään ryhmässä. Haluatko mennä ryhmäsivulle liittymään tai luomaan ryhmän?')) {
                    try { window.location.hash = '#groups'; } catch (e) {}
                  }
                  setGroupPickerLoading(false);
                  return;
                }

                // Näytetään modal valinnalle
                setMyGroups(groups);
                setShowGroupPicker(true);
                setGroupPickerLoading(false);
              } catch (err) {
                console.error('Ryhmien haku epäonnistui', err);
                setGroupPickerError(err.message || 'Ryhmien haku epäonnistui');
                setGroupPickerLoading(false);
              }
            }}>Lisää ryhmään</button>
          </div>
          {/* Group picker modal */}
          {showGroupPicker && (
            <div className="group-picker-overlay" onClick={() => setShowGroupPicker(false)}>
              <div className="group-picker-modal" onClick={e => e.stopPropagation()} role="dialog">
                <h3>Valitse ryhmä</h3>
                {groupPickerLoading ? (
                  <div className="loading">Ladataan...</div>
                ) : groupPickerError ? (
                  <div className="error">{groupPickerError}</div>
                ) : myGroups.length === 0 ? (
                  <div>Et ole jäsenenä missään ryhmässä.</div>
                ) : (
                  <ul className="group-picker-list">
                    {myGroups.map(g => (
                      <li key={g.group_id} className="group-picker-item">
                        <div className="group-picker-row">
                          <div className="group-picker-name">{g.group_name}</div>
                          <button className="btn" onClick={() => handleAddToGroup(g.group_id)}>Lisää</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{marginTop:8}}>
                  <button className="btn" onClick={() => setShowGroupPicker(false)}>Peruuta</button>
                </div>
              </div>
            </div>
          )}
          
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

          {/* Average rating (calculated from reviews) */}
          {reviews && reviews.length > 0 && (() => {
            const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
            const avg = sum / reviews.length;
            const pct = Math.max(0, Math.min(100, (avg / 5) * 100));
            return (
              <div className="average-rating">
                <div className="stars-outer" aria-hidden>
                  {'★★★★★'}
                  <div className="stars-inner" style={{ width: `${pct}%` }}>{'★★★★★'}</div>
                </div>
                <div className="avg-number">{avg.toFixed(1)} / 5 ({reviews.length})</div>
              </div>
            );
          })()}

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
            {
              (() => {
                let stored = null;
                try { stored = localStorage.getItem('user'); } catch (e) { stored = null; }
                let isLogged = false;
                try { const parsed = stored ? JSON.parse(stored) : null; isLogged = !!(parsed && parsed.user_id); } catch (e) { isLogged = false; }
                return (
                  <button className="btn write-review-btn" onClick={() => {
                    if (!isLogged) { window.alert('Kirjaudu sisään kirjoittaaksesi arvostelun.'); return; }
                    setShowReviewModal(true);
                  }}>
                    {isLogged ? 'Kirjoita arvostelu' : 'Kirjaudu sisään arvostelleksesi elokuva'}
                  </button>
                );
              })()
            }
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map(review => {
                  const stored = Number(review.rating || review.rating_raw || 0);
                  const displayRating = stored > 5 ? (stored / 2) : stored; // if stored as 0..10, convert to 0..5
                  const pct = Math.max(0, Math.min(100, (displayRating / 5) * 100));
                  return (
                    <div key={review.review_id} className="review-card">
                      <div className="review-rating">
                        <span className="stars-outer" aria-hidden>
                          {'★★★★★'}
                          <span className="stars-inner" style={{ width: `${pct}%` }}>{'★★★★★'}</span>
                        </span>
                        <span style={{ marginLeft: 8 }}>{displayRating % 1 === 0 ? displayRating.toFixed(0) : displayRating.toFixed(1)} / 5</span>
                      </div>
                      <p className="review-text">{review.review_text}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-reviews">Ei vielä arvosteluja</p>
            )}
          </div>

          {/* Review modal */}
          {showReviewModal && (
            <div className="review-modal-overlay" onClick={() => { if (!reviewSubmitting) setShowReviewModal(false); }}>
              <div className="review-modal" onClick={e => e.stopPropagation()} role="dialog">
                <h3>Kirjoita arvostelu</h3>
                <div className="review-form-row">
                  <label>Tähdet:</label>
                  <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>
                    {Array.from({ length: 5 }, (_, i) => 5 - i).map(val => (
                      <option key={val} value={val}>{String(val)}</option>
                    ))}
                  </select>
                </div>
                <div className="review-form-row">
                  <label>Kirjoita arvostelu</label>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={6} />
                </div>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <button className="btn" disabled={reviewSubmitting} onClick={async () => {
                    try {
                      const stored = localStorage.getItem('user');
                      if (!stored) { window.alert('Kirjaudu sisään kirjoittaaksesi arvostelun.'); return; }
                      const parsed = JSON.parse(stored);
                      if (!parsed || !parsed.user_id) { window.alert('Kirjaudu sisään kirjoittaaksesi arvostelun.'); return; }
                      if (!reviewText || reviewText.trim().length === 0) { window.alert('Kirjoita ensin arvostelusi.'); return; }
                      setReviewSubmitting(true);
                      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
                      // store rating as integer 1..5
                      const payload = { tmdb_id: Number(movieId), user_id: Number(parsed.user_id), rating: Math.round(Number(reviewRating)), review_text: reviewText.trim() };
                      const res = await fetch(`${apiBaseNoSlash}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                      if (!res.ok) {
                        const txt = await res.text();
                        throw new Error('HTTP ' + res.status + ': ' + txt);
                      }
                      const created = await res.json();
                      // backend returns rows array in model; normalize
                      const newReview = Array.isArray(created) ? created[0] : created;
                      // ensure keys: review_id, rating, review_text, user_id, tmdb_id
                      setReviews(prev => [newReview, ...prev]);
                      // notify profile to refresh its data
                      try { window.dispatchEvent(new Event('userChanged')); } catch (e) {}
                      setShowReviewModal(false);
                      setReviewText('');
                      setReviewRating(5);
                    } catch (err) {
                      console.error('Arvostelun lähetys epäonnistui', err);
                      window.alert('Arvostelun lähetys epäonnistui: ' + (err.message || 'virhe'));
                    } finally {
                      setReviewSubmitting(false);
                    }
                  }}>Tallenna</button>
                  <button className="btn" onClick={() => { if (!reviewSubmitting) setShowReviewModal(false); }}>Peruuta</button>
                </div>
              </div>
            </div>
          )}
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
