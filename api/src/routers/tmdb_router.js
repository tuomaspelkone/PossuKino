import express from 'express';
import tmdbController from '../controllers/tmdb_controller.js';

const router = express.Router();

// GET /tmdb/genres - fetch TMDB genre list
router.get('/genres', tmdbController.getGenres);

// GET /tmdb/search?q=...&page=...
router.get('/search', tmdbController.searchMovies);

// GET /tmdb/popular?page=...
router.get('/popular', tmdbController.getPopular);

// GET /tmdb/movie/:id
router.get('/movie/:id', tmdbController.getMovieDetails);

export default router;
