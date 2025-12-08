import axios from 'axios';
import pool from '../database.js';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const CERT_ORDER = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

function getAuthOptions() {
  const token = process.env.TMDB_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (token) {
    return { headers: { Authorization: `Bearer ${token}` } };
  }
  return { params: { api_key: apiKey } };
}

const mapMovie = (m) => ({
  tmdb_id: m.id,
  movie_id: m.id,
  movie_title: m.title,
  movie_description: m.overview,
  movie_year: m.release_date ? m.release_date.split('-')[0] : '',
  movie_image: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
});

const isCertAllowed = (movieCert, targetCert) => {
  if (!movieCert) return false;
  const movieIdx = CERT_ORDER.indexOf(movieCert);
  const targetIdx = CERT_ORDER.indexOf(targetCert);
  if (movieIdx === -1 || targetIdx === -1) return false;
  return movieIdx <= targetIdx; // .lte semantics
};

const getMovieCertification = async (tmdbId, options, cache) => {
  if (cache.has(tmdbId)) return cache.get(tmdbId);
  try {
    const resp = await axios.get(`${TMDB_BASE}/movie/${tmdbId}/release_dates`, options);
    const results = Array.isArray(resp.data?.results) ? resp.data.results : [];
    const us = results.find(r => r.iso_3166_1 === 'US');
    const cert = us?.release_dates?.find(rd => rd.certification)?.certification || '';
    cache.set(tmdbId, cert);
    return cert;
  } catch (err) {
    console.error('Certification fetch failed', tmdbId, err?.response?.data || err.message || err);
    cache.set(tmdbId, '');
    return '';
  }
};

// Only insert tmdb_id to database (minimal local storage)
const upsertMovieId = async (tmdb_id) => {
  try {
    const result = await pool.query(
      `INSERT INTO movies (tmdb_id)
       VALUES ($1)
       ON CONFLICT (tmdb_id) DO NOTHING
       RETURNING tmdb_id`,
      [tmdb_id]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error upserting movie ID:', err);
  }
};

export const searchMovies = async (req, res) => {
  try {
    const q = req.query.q || '';
    const page = req.query.page || 1;
    const genres = req.query.genres; // comma-separated genre IDs
    const certification = req.query.certification; // e.g., "PG-13"

    console.log('Search params:', { q, page, genres, certification });

    let url = '';
    let options = getAuthOptions();
    const genreSet = genres ? new Set(genres.split(',').map(Number)) : null;

    // If user typed a query, always use the search endpoint so the text matters.
    // When genres are also selected, filter results on our side so only movies containing
    // at least one of the selected genres are returned.
    if (q) {
      url = `${TMDB_BASE}/search/movie`;
      const params = { query: q, page, include_adult: false, language: 'en-US' };
      if (options.params) options.params = { ...options.params, ...params };
      else options.params = params;
    } else if (genres || certification) {
      // No text search, but filters present -> use discover
      url = `${TMDB_BASE}/discover/movie`;
      const params = { page, language: 'en-US', sort_by: 'popularity.desc' };
      if (genres) params.with_genres = genres;
      if (certification) {
        params.certification_country = 'US';
        params['certification.lte'] = certification; // Use .lte to include and below
      }
      if (options.params) options.params = { ...options.params, ...params };
      else options.params = params;
    } else {
      // fallback to popular
      url = `${TMDB_BASE}/movie/popular`;
      if (options.params) options.params = { ...options.params, page, language: 'en-US' };
      else options.params = { page, language: 'en-US' };
    }

    console.log('TMDB request:', url, options.params);

    const response = await axios.get(url, options);
    const data = response.data;

    // If we searched by text and filters exist, filter client-side by genres and certification.
    let filtered = Array.isArray(data.results) ? data.results : [];
    const certCache = new Map();
    if (q) {
      if (genreSet) {
        filtered = filtered.filter(m => Array.isArray(m.genre_ids) && m.genre_ids.some(id => genreSet.has(id)));
      }
      if (certification) {
        // Fetch certification per movie (US) and filter with .lte semantics
        const withCerts = await Promise.all(filtered.map(async (m) => {
          const cert = await getMovieCertification(m.id, getAuthOptions(), certCache);
          return { movie: m, cert };
        }));
        filtered = withCerts
          .filter(({ cert }) => isCertAllowed(cert, certification))
          .map(({ movie }) => movie);
      }
    }

    const results = filtered.map(m => {
      const mapped = mapMovie(m);
      // Insert only tmdb_id in background (no other data stored)
      upsertMovieId(m.id).catch(err => console.error('Upsert failed:', err));
      return mapped;
    });

    console.log(`Found ${results.length} results`);

    const effectiveTotalPages = (q && (genreSet || certification)) ? 1 : data.total_pages;
    res.json({ results, page: data.page, total_pages: effectiveTotalPages });
  } catch (error) {
    console.error('TMDB search error:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'TMDB search failed' });
  }
};

export const getGenres = async (req, res) => {
  try {
    const options = getAuthOptions();
    const response = await axios.get(`${TMDB_BASE}/genre/movie/list`, options);
    res.json(response.data.genres || []);
  } catch (error) {
    console.error('TMDB genres fetch error:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'TMDB genres fetch failed' });
  }
};

export const getPopular = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const options = getAuthOptions();
    if (options.params) options.params = { ...options.params, page, language: 'en-US' };
    else options.params = { page, language: 'en-US' };

    const response = await axios.get(`${TMDB_BASE}/movie/popular`, options);
    const data = response.data;
    const results = Array.isArray(data.results) ? data.results.map(m => {
      const mapped = mapMovie(m);
      // Insert only tmdb_id in background (no other data stored)
      upsertMovieId(m.id).catch(err => console.error('Upsert failed:', err));
      return mapped;
    }) : [];
    res.json({ results, page: data.page, total_pages: data.total_pages });
  } catch (error) {
    console.error('TMDB popular error:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'TMDB popular fetch failed' });
  }
};

export const getMovieDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const options = getAuthOptions();
    const response = await axios.get(`${TMDB_BASE}/movie/${id}`, options);
    const m = response.data;
    const mapped = mapMovie(m);
    upsertMovieId(m.id).catch(err => console.error('Upsert failed:', err));
    res.json(mapped);
  } catch (error) {
    console.error('TMDB movie fetch error:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'TMDB movie fetch failed' });
  }
};

export default { searchMovies, getPopular, getMovieDetails, getGenres };
