import { Router } from "express";
import { getMovie_genres, getMovie_genre, addMovie_genre, updateMovie_genre, deleteMovie_genre } from "../controllers/movie_genres_controller.js";

const movie_genres_router = Router();

movie_genres_router.get("/", getMovie_genres);
movie_genres_router.get("/:movie_id", getMovie_genre);
movie_genres_router.post("/", addMovie_genre);
movie_genres_router.put("/:movie_id", updateMovie_genre);
movie_genres_router.delete("/:movie_id", deleteMovie_genre);

export default movie_genres_router;