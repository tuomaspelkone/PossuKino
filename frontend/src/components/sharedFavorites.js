import React, { useEffect, useState } from 'react';
import './sharedFavorites.css';

function SharedFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


useEffect(() => {
    async function fetchSharedFavorites() {
        try {
            const apiBase = process.env.REACT_APP_API_URL || '';
            const apiBaseNoSlash = apiBase.replace(/\/$/, '');

            const pathParts = window.location.pathname.split('/');
            const userId = pathParts[pathParts.length - 1];
            
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
        }, []);


    return(
        <div className="shared-favorites">
            <h1>Jaettu suosikkilista</h1>
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
                            return (
                                <div className="fav-row" key={f.favorite_id}>
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
        </div>
    );
}

export default SharedFavorites;