import { Router } from "express";
import { getPopularMovies, getCachedSearchMovies } from "../services/cache_service.js";

const cache_router = Router();

/**
 * GET /cache/popular
 * Hakee KAIKKI elokuvat välimuistin kautta
 * 
 * Esimerkki: http://localhost:3001/cache/popular
 */
cache_router.get("/popular", async (req, res, next) => {
  try {
    const movies = await getPopularMovies();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: "Virhe elokuvien haussa" });
    next(error);
  }
});

/**
 * GET /cache/search?q=hakusana
 * Hakee elokuvia HAKUSANALLA välimuistin kautta
 * 
 * Esimerkki: http://localhost:3001/cache/search?q=avatar
 */
cache_router.get("/search", async (req, res, next) => {
  try {
    const { q, genres, certification } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "Hakusana puuttuu (q-parametri)" });
    }
    
    const movies = await getCachedSearchMovies(q, genres, certification);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: "Virhe elokuvien haussa" });
    next(error);
  }
});

export default cache_router;