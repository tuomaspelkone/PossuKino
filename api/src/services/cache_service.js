import NodeCache from "node-cache";
import { getAll, search } from "../models/movies_model.js";

// Välimuisti: tiedot säilyvät 1 tunniksi (3600 sekuntia)
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * Hakee KAIKKI elokuvat tietokannasta välimuistin kautta
 * Ensimmäinen kutsu hakee tietokannasta, seuraavat hakevat välimuistista
 */
export async function getPopularMovies() {
  const cacheKey = "all_movies";
  
  // Tarkista ensin välimuisti
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log("✅ HAETTU VÄLIMUISTISTA - nopea!");
    return cachedData;
  }

  try {
    // Välimuisti oli tyhjä, haetaan tietokannasta
    const movies = await getAll();
    // Tallennetaan välimuistiin seuraavia kutsu...
    cache.set(cacheKey, movies);
    console.log("✅ HAETTU TIETOKANNASTA - tallennettu välimuistiin");
    return movies;
  } catch (error) {
    console.error("❌ VIRHE:", error.message);
    throw error;
  }
}

/**
 * Hakee elokuvia HAKUSANALLA välimuistin kautta
 */
export async function getCachedSearchMovies(query, genres = null, certification = null) {
  const cacheKey = `search_${query}_${genres}_${certification}`;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log("✅ HAETTU VÄLIMUISTISTA");
    return cachedData;
  }

  try {
    const genreArray = genres ? genres.split(',').map(Number) : null;
    const movies = await search(query, genreArray, certification);
    cache.set(cacheKey, movies);
    console.log("✅ HAETTU TIETOKANNASTA");
    return movies;
  } catch (error) {
    console.error("❌ VIRHE:", error.message);
    throw error;
  }
}

/**
 * Tyhjennä välimuisti (käytetään kun elokuva lisätään/päivitetään)
 */
export function clearMovieCache() {
  cache.flushAll();
  console.log("🗑️  VÄLIMUISTI TYHJENNETTY");
}