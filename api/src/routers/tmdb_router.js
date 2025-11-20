import express from 'express';
import tmdbController from '../controllers/tmdb_controller.js';

const router = express.Router();

// GET /tmdb/search?q=...&page=...
router.get('/search', tmdbController.searchMovies);

// GET /tmdb/popular?page=...
router.get('/popular', tmdbController.getPopular);

export default router;
