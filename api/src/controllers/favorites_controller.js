import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/favorites_model.js";
import axios from 'axios';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function getAuthOptions() {
  const token = process.env.TMDB_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (token) return { headers: { Authorization: `Bearer ${token}` } };
  return { params: { api_key: apiKey } };
}

function mapMovie(m) {
  if (!m) return null;
  return {
    tmdb_id: m.id,
    movie_id: m.id,
    movie_title: m.title,
    movie_description: m.overview,
    movie_year: m.release_date ? m.release_date.split('-')[0] : '',
    movie_image: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
  };
}

export async function getFavorites(req, res, next) {
  try {
    const favorites = await getAll();

    // Enrich favorites with movie details from TMDB (unique ids only)
    const options = getAuthOptions();
    const uniqueIds = [...new Set(favorites.map(f => f.tmdb_id).filter(Boolean))];

    const moviePromises = uniqueIds.map(id =>
      axios.get(`${TMDB_BASE}/movie/${id}`, options)
        .then(response => mapMovie(response.data))
        .catch(err => {
          console.error('TMDB fetch error for id', id, err?.response?.data || err.message || err);
          return null;
        })
    );

    const moviesArray = await Promise.all(moviePromises);
    const moviesById = {};
    moviesArray.forEach(m => { if (m) moviesById[m.tmdb_id] = m; });

    const enriched = favorites.map(f => ({ ...f, movie: moviesById[f.tmdb_id] || null }));
    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

export async function getFavorite(req, res, next) {
  try {
    const favorite = await getOne(req.params.favorite_id);
    if (!favorite) return res.status(404).json({ error: "Favorite not found" });

    // Enrich single favorite with movie details
    const options = getAuthOptions();
    try {
      const response = await axios.get(`${TMDB_BASE}/movie/${favorite.tmdb_id}`, options);
      favorite.movie = mapMovie(response.data);
    } catch (err) {
      console.error('TMDB fetch error for favorite', favorite.favorite_id, err?.response?.data || err.message || err);
      favorite.movie = null;
    }

    res.json(favorite);
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateFavorite(req, res, next) {
  try {
    const response = await updateOne(req.params.favorite_id, req.body);
    if (!response || response.length === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteFavorite(req, res, next) {
  try {
    const deleted = await deleteOne(req.params.favorite_id);
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    res.json(deleted);
  } catch (err) {
    next(err);
  }
}