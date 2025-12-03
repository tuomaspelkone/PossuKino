import React, { useEffect, useState } from 'react';
import MovieDetail from './movieDetail';
import './sharedFavorites.css';

function SharedFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sharedUserId, setSharedUserId] = useState(null);
    const [hash, setHash] = useState(window.location.hash || '');


useEffect(() => {
    async function fetchSharedFavorites() {
        try {
            const apiBase = process.env.REACT_APP_API_URL || '';
            const apiBaseNoSlash = apiBase.replace(/\/$/, '');

            const pathParts = window.location.pathname.split('/');
            const userId = pathParts[pathParts.length - 1];
            setSharedUserId(userId);
            
            const resFavs = await fetch(`${apiBaseNoSlash}/favorites`);
            if (!resFavs.ok) throw new Error('Suosikkien haku epäonnistui');
            
            const allFavorites = await resFavs.json();
            const userFavorites = allFavorites.filter(fav => fav.user_id === parseInt(userId, 10));

            setFavorites(userFavorites);
            setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }

        fetchSharedFavorites();
        // listen for hash changes so we can show MovieDetail inline
        const onHash = () => setHash(window.location.hash || '');
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
        }, []);


    // If the current hash indicates a movie, render MovieDetail (so hash navigation works on /shared-favorites/*)
    const isMovieDetail = hash.startsWith('#movie/');
    const movieIdFromHash = isMovieDetail ? hash.replace('#movie/', '') : null;

    return(
        <div className="shared-favorites">
            <h1>Jaettu suosikkilista</h1>
            {isMovieDetail ? (
                <MovieDetail movieId={movieIdFromHash} />
            ) : (
                <>
                {loading && <p>Ladataan...</p>}
                {error && <p>Virhe: {error}</p>}
                {!loading && !error && (
                    favorites.length === 0 ? (
                        <p>Ei suosikkeja.</p>
                    ) : (
                        <div className="favorites-list">
                            {favorites.map(f => {
                                const movie = f.movie || {};
                                const title = movie.movie_title || movie.title || movie.name || '—';
                                const year = movie.movie_year || movie.year || '';
                                const tmdbId = movie.tmdb_id || f.tmdb_id;
                                const openMovie = () => {
                                    // Save return route so MovieDetail can navigate back if needed
                                    if (sharedUserId) {
                                        try { sessionStorage.setItem('returnTo', `/shared-favorites/${sharedUserId}`); } catch (e) {}
                                    }
                                    // Set the hash so the app shows MovieDetail
                                    window.location.hash = `#movie/${tmdbId}`;
                                    // Also attach history.state (best-effort) for extra detection
                                    try {
                                        const state = { fromFavorites: true, userId: sharedUserId };
                                        window.history.replaceState(state, '', window.location.href);
                                    } catch (e) {}
                                };
                                return (
                                    <div className="fav-row" key={f.favorite_id} onClick={openMovie} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') openMovie(); }}>
                                        <div className="fav-info">
                                            <div className="fav-title">{title}</div>
                                            <div className="fav-year">{year}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
                </>
            )}
        </div>
    );
}

export default SharedFavorites;