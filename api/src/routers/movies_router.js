import { Router } from "express";
import { getMovies, getMovie, addMovie, updateMovie, deleteMovie, searchMovies } from "../controllers/movies_controller.js";

const movie_router = Router();

movie_router.get("/search", searchMovies);
movie_router.get("/", getMovies);
movie_router.get("/:tmdb_id", getMovie);
movie_router.post("/", addMovie);
movie_router.put("/:tmdb_id", updateMovie);
movie_router.delete("/:tmdb_id", deleteMovie);

export default movie_router;
