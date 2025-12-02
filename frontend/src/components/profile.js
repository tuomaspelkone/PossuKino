import './profile.css';
import React, { useEffect, useState, useRef } from 'react';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [groups, setGroups] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const prevImageUrlRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const apiBase = process.env.REACT_APP_API_URL || '';

    async function fetchUserData(userId) {
      try {
        setLoading(true);

        const resUser = await fetch(`${apiBase.replace(/\/$/, '')}/user/${userId}`);
        if (!resUser.ok) throw new Error(`User HTTP ${resUser.status}`);
        const userData = await resUser.json();
        setUser(userData);

        const apiBaseNoSlash = apiBase.replace(/\/$/, '');
        const [resFavs, resMovies, resGroupMembers, resGroups, resReviews] = await Promise.all([
          fetch(`${apiBaseNoSlash}/favorites`),
          fetch(`${apiBaseNoSlash}/movies`),
          fetch(`${apiBaseNoSlash}/group_members`),
          fetch(`${apiBaseNoSlash}/group`),
          fetch(`${apiBaseNoSlash}/reviews`),
        ]);

        if (!resFavs.ok) throw new Error(`Favorites HTTP ${resFavs.status}`);
        if (!resMovies.ok) throw new Error(`Movies HTTP ${resMovies.status}`);
        if (!resReviews.ok) throw new Error(`Reviews HTTP ${resReviews.status}`);

        const favs = await resFavs.json();
        const movies = await resMovies.json();
        const groupMembers = await resGroupMembers.json();
        const groupsAll = await resGroups.json();
        const reviewsAll = await resReviews.json();

        async function fetchDetailsForIds(ids) {
          const uniq = Array.from(new Set(ids.filter(Boolean)));
          if (uniq.length === 0) return {};
          const results = await Promise.all(uniq.map(id =>
            fetch(`${apiBaseNoSlash}/tmdb/movie/${id}`).then(r => r.ok ? r.json().catch(() => null) : null).catch(() => null)
          ));
          const map = {};
          uniq.forEach((id, i) => { if (results[i]) map[Number(id)] = results[i]; });
          return map;
        }

        const userFavs = favs.filter(f => Number(f.user_id) === Number(userData.user_id));
        const favIds = userFavs.map(f => Number(f.movie_id || f.tmdb_id || f.tmdbId || f.tmdb));
        const userReviewRows = reviewsAll.filter(r => Number(r.user_id) === Number(userData.user_id));
        const reviewIds = userReviewRows.map(r => Number(r.movie_id || r.tmdb_id || r.tmdbId || r.tmdb));

        const neededIds = Array.from(new Set([...favIds, ...reviewIds]));
        const detailsMap = await fetchDetailsForIds(neededIds);

        // Rakennetaan suosikit: säilytetään favorite_id jotta voidaan poistaa
        const favMovies = userFavs.map(f => {
          const favKey = Number(f.tmdb_id || f.movie_id || f.tmdbId || f.tmdb);
          const local = movies.find(m => Number(m.movie_id || m.tmdb_id || m.tmdbId || m.tmdb) === favKey);
          const movieObj = detailsMap[favKey] || local || null;
          if (!movieObj) return null;
          return { favorite_id: f.favorite_id, tmdb_id: favKey, movie: movieObj };
        }).filter(Boolean);
        setFavorites(favMovies);
        const userMemberships = groupMembers.filter(gm => Number(gm.user_id) === Number(userData.user_id));
        const userGroups = userMemberships.map(m => {
          const grp = groupsAll.find(g => Number(g.group_id) === Number(m.group_id));
          if (!grp) return null;
          return { ...grp, member_id: m.member_id, group_admin: !!m.group_admin };
        }).filter(Boolean);
        setGroups(userGroups);
        const userReviews = userReviewRows.map(r => {
          const reviewKey = Number(r.movie_id || r.tmdb_id || r.tmdbId || r.tmdb);
          const movieObj = detailsMap[reviewKey] || movies.find(m => Number(m.movie_id || m.tmdb_id || m.tmdbId || m.tmdb) === reviewKey) || null;
          return { ...r, movie: movieObj };
        });
        setReviews(userReviews);
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    }

    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.user_id) {
        setUser(parsed);
        fetchUserData(parsed.user_id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function onUserChanged() {
      const stored = localStorage.getItem('user');
      if (!stored) {
        setUser(null);
        setFavorites([]);
        setGroups([]);
        setReviews([]);
        setLoading(false);
        return;
      }
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.user_id) {
          const apiBase = process.env.REACT_APP_API_URL || '';
          const apiBaseNoSlash = apiBase.replace(/\/$/, '');
          (async () => {
            setLoading(true);
            try {
              const resUser = await fetch(`${apiBaseNoSlash}/user/${parsed.user_id}`);
              if (!resUser.ok) throw new Error(`User HTTP ${resUser.status}`);
              const userData = await resUser.json();
              setUser(userData);

              const [resFavs, resMovies, resGroupMembers, resGroups, resReviews] = await Promise.all([
                fetch(`${apiBaseNoSlash}/favorites`),
                fetch(`${apiBaseNoSlash}/movies`),
                fetch(`${apiBaseNoSlash}/group_members`),
                fetch(`${apiBaseNoSlash}/group`),
                fetch(`${apiBaseNoSlash}/reviews`),
              ]);

              const favs = await resFavs.json();
              const movies = await resMovies.json();
              const groupMembers = await resGroupMembers.json();
              const groupsAll = await resGroups.json();
              const reviewsAll = await resReviews.json();

              async function fetchDetailsForIds(ids) {
                const uniq = Array.from(new Set(ids.filter(Boolean)));
                if (uniq.length === 0) return {};
                const results = await Promise.all(uniq.map(id =>
                  fetch(`${apiBaseNoSlash}/tmdb/movie/${id}`).then(r => r.ok ? r.json().catch(() => null) : null).catch(() => null)
                ));
                const map = {};
                uniq.forEach((id, i) => { if (results[i]) map[Number(id)] = results[i]; });
                return map;
              }

              const userFavs = favs.filter(f => Number(f.user_id) === Number(userData.user_id));
              const favIds = userFavs.map(f => Number(f.movie_id || f.tmdb_id || f.tmdbId || f.tmdb));
              const userReviewRows = reviewsAll.filter(r => Number(r.user_id) === Number(userData.user_id));
              const reviewIds = userReviewRows.map(r => Number(r.movie_id || r.tmdb_id || r.tmdbId || r.tmdb));

              const neededIds = Array.from(new Set([...favIds, ...reviewIds]));
              const detailsMap = await fetchDetailsForIds(neededIds);

              const favMovies = userFavs.map(f => {
                const favKey = Number(f.tmdb_id || f.movie_id || f.tmdbId || f.tmdb);
                const local = movies.find(m => Number(m.movie_id || m.tmdb_id || m.tmdbId || m.tmdb) === favKey);
                const movieObj = detailsMap[favKey] || local || null;
                if (!movieObj) return null;
                return { favorite_id: f.favorite_id, tmdb_id: favKey, movie: movieObj };
              }).filter(Boolean);
              setFavorites(favMovies);

              const userMemberships = groupMembers.filter(gm => Number(gm.user_id) === Number(userData.user_id));
              const userGroups = userMemberships.map(m => {
                const grp = groupsAll.find(g => Number(g.group_id) === Number(m.group_id));
                if (!grp) return null;
                return { ...grp, member_id: m.member_id, group_admin: !!m.group_admin };
              }).filter(Boolean);
              setGroups(userGroups);

              const userReviews = userReviewRows.map(r => {
                const reviewKey = Number(r.movie_id || r.tmdb_id || r.tmdbId || r.tmdb);
                const movieObj = detailsMap[reviewKey] || movies.find(m => Number(m.movie_id || m.tmdb_id || m.tmdbId || m.tmdb) === reviewKey) || null;
                return { ...r, movie: movieObj };
              });
              setReviews(userReviews);
            } catch (err) {
              setError(err.message || 'Error fetching data');
            } finally {
              setLoading(false);
            }
          })();
        }
      } catch (err) {
        setUser(null);
      }
    }

    window.addEventListener('userChanged', onUserChanged);
    return () => window.removeEventListener('userChanged', onUserChanged);
  }, []);

  useEffect(() => {
    return () => {
      if (prevImageUrlRef.current) URL.revokeObjectURL(prevImageUrlRef.current);
    };
  }, []);

  function handleImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      if (prevImageUrlRef.current) {
        URL.revokeObjectURL(prevImageUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      prevImageUrlRef.current = url;
      setSelectedImageFile(file);
      setSelectedImageUrl(url);
    } catch (err) {
      console.error('Could not create object URL for image', err);
    }
  }

  function renderStars(count) {
    // Accept stored ratings that might be scaled (0..10) or normal (0..5)
    let val = Number(count) || 0;
    if (val > 5) val = val / 2; // convert stored 0..10 to 0..5
    const pct = Math.max(0, Math.min(100, (val / 5) * 100));
    return (
      <span className="stars" aria-label={`Arvostelu ${val} tähteä`}>
        <span className="stars-outer">{'★★★★★'}<span className="stars-inner" style={{ width: `${pct}%` }}>{'★★★★★'}</span></span>
      </span>
    );
  }

  async function handleRemoveFavorite(favoriteId) {
    if (!favoriteId) return;
    try {
      const apiBase = process.env.REACT_APP_API_URL || '';
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const res = await fetch(`${apiBaseNoSlash}/favorites/${favoriteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Suosikin poisto epäonnistui (HTTP ${res.status})`);
      setFavorites(prev => prev.filter(f => f.favorite_id !== favoriteId));
    } catch (err) {
      setError(err.message || 'Suosikin poisto epäonnistui');
    }
  }

  function handleShareFavorites(){
    const shareUrl = `${window.location.origin}/shared-favorites/${user.user_id}`;
    window.open(shareUrl,'_blank');
  }



  if (loading) return <div className="profile-empty">Ladataan profiilia…</div>;
  if (error) return <div className="profile-empty">Virhe: {error}</div>;

  if (!user) return null;

  return (
    <>
      <div className="profile-empty">
        <div className="profile-icon">
          <img src={selectedImageUrl || "/profile-placeholder.svg"} alt="Profiilikuva" width="60" height="60" />
        </div>
        <div className="profile-info">
          <div>Käyttäjänimi: {user?.username || '—'}</div>
          <div>Sähköposti: {user?.email || '—'}</div>
        </div>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button className="btn" onClick={() => setShowModal(true)}>Muokkaa profiilitietoja</button>
          <button
            className="btn"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setFavorites([]);
              setGroups([]);
              setReviews([]);
              window.dispatchEvent(new Event('userChanged'));
                try { window.location.hash = '#home'; } catch (e) {}
            }}
          >Kirjaudu Ulos</button>
        </div>
      </div>

      <div className="profile-favourites">
        <div className="favourites-header">
          <p>Suosikit:</p>
            <button className="btn share-favorites-btn" onClick={handleShareFavorites}>
              Jaa suosikkilista
            </button>
        </div>
        {favorites.length === 0 ? (
          <p>Ei suosikkeja.</p>
        ) : (
          <div className="favs-list">
            {favorites.map(f => (
              <div className="fav-row" key={f.favorite_id}>
                <div className="fav-info">
                  <div className="fav-title">{f.movie.movie_title || f.movie.title || f.movie.name || '—'}</div>
                  <div className="fav-year">{f.movie.movie_year || f.movie.year || ''}</div>
                </div>
                <button className="btn fav-remove-btn" onClick={() => handleRemoveFavorite(f.favorite_id)}>
                  Poista
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Muokkaa profiilitietoja</h3>
                <button className="btn" onClick={() => setShowModal(false)}>Sulje</button>
              </div>
              <div className="modal-body">
                <div className="modal-image-row">
                  <div className="modal-image-preview-wrap">
                    <img src={selectedImageUrl || '/profile-placeholder.svg'} alt="Esikatselu" className="modal-image-preview" />
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                    <label className="modal-label">Profiilikuva (valinnainen)</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>
                <label className="modal-label">Nykyinen salasana</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="modal-input"
                  aria-label="Nykyinen salasana"
                />

                <label className="modal-label">Uusi salasana</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="modal-input"
                  aria-label="Uusi salasana"
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn"
                  onClick={async () => {
                    try {
                      if (!user) return;
                      const apiBase = process.env.REACT_APP_API_URL || '';
                      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
                      if (!newPassword || newPassword.length < 6) {
                        setError('Uuden salasanan on oltava vähintään 6 merkkiä.');
                        return;
                      }
                      const res = await fetch(`${apiBaseNoSlash}/user/${user.user_id}/password`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword, newPassword }),
                      });
                      if (!res.ok) throw new Error(`HTTP ${res.status}`);
                      setShowModal(false);
                      setCurrentPassword('');
                      setNewPassword('');
                    } catch (err) {
                      setError(err.message || 'Salasanan vaihto epäonnistui');
                    }
                  }}
                >Tallenna salasana</button>

                <button
                  className="btn"
                  onClick={async () => {
                    if (!user) return;
                    const confirmed = window.confirm('Haluatko varmasti poistaa tilisi? Toimintoa ei voi perua.');
                    if (!confirmed) return;
                    try {
                      const apiBase = process.env.REACT_APP_API_URL || '';
                      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
                      const res = await fetch(`${apiBaseNoSlash}/user/${user.user_id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error(`HTTP ${res.status}`);
                      setShowModal(false);
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.dispatchEvent(new Event('userChanged'));
                      try { window.location.hash = '#home'; } catch (e) {}
                    } catch (err) {
                      setError(err.message || 'Tilin poisto epäonnistui');
                    }
                  }}
                >Poista tili</button>
              </div>
            </div>
          </div>
        )}

      <div className="profile-groups">
        <p className="section-title">Omat ryhmät:</p>
        {groups.length === 0 ? (
          <p>Et ole jäsenenä missään ryhmässä.</p>
        ) : (
          groups.map(g => (
            <div className="group-row" key={g.group_id}>
              <div className="group-name">{g.group_name}</div>
              <div className="group-actions">
                <button className="btn" onClick={() => { try { sessionStorage.setItem('returnToGroup', String(g.group_id)); } catch(e){} window.location.hash = '#groups'; }}>Linkki ryhmään</button>
                {g.group_admin ? (
                  <button className="btn" onClick={async () => {
                    if (!window.confirm('Haluatko varmasti poistaa ryhmän? Tätä ei voi perua.')) return;
                    try {
                      const apiBase = process.env.REACT_APP_API_URL || '';
                      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
                      const token = localStorage.getItem('token');
                      const headers = {};
                      if (token) headers['Authorization'] = `Bearer ${token}`;
                      const res = await fetch(`${apiBaseNoSlash}/group/${g.group_id}`, { method: 'DELETE', headers });
                      if (!res.ok) throw new Error('HTTP ' + res.status);
                      setGroups(prev => prev.filter(x => Number(x.group_id) !== Number(g.group_id)));
                    } catch (err) {
                      setError(err.message || 'Ryhmäpoisto epäonnistui');
                    }
                  }}>Poista ryhmä</button>
                ) : (
                  <button className="btn" onClick={async () => {
                    if (!g.member_id) return;
                    if (!window.confirm('Haluatko poistua ryhmästä?')) return;
                    try {
                      const apiBase = process.env.REACT_APP_API_URL || '';
                      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
                      const token = localStorage.getItem('token');
                      const headers = {};
                      if (token) headers['Authorization'] = `Bearer ${token}`;
                      const res = await fetch(`${apiBaseNoSlash}/group_members/${g.member_id}`, { method: 'DELETE', headers });
                      if (!res.ok) throw new Error('HTTP ' + res.status);
                      setGroups(prev => prev.filter(x => Number(x.group_id) !== Number(g.group_id)));
                    } catch (err) {
                      setError(err.message || 'Poistuminen epäonnistui');
                    }
                  }}>Poistu ryhmästä</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="profile-reviews">
        <p className="section-title">Selaa arvostelujasi:</p>
        {reviews.length === 0 ? (
          <p>Ei arvosteluja.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map(r => (
              <div key={r.review_id} className="review-row">
                <div className="review-title">{r.movie?.movie_title || r.movie?.title || r.movie?.name || '—'}</div>
                <div className="review-body">
                  <div className="review-stars">{renderStars(r.rating)}</div>
                  <div className="review-text">{r.review_text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
