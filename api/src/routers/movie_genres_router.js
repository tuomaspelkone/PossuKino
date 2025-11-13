import { Router } from "express";
import { getMovie_genres, getMovie_genres, addMovie_genres, updateMovie_genres, deleteMovie_genres } from "../controllers/movie_genres_controller.js";

const movie_genres_router = Router();

movie_genres_router.get("/", getMovie_genres);
movie_genres_router.get("/:movie_id", getMovie_genres);
movie_genres_router.post("/", addMovie_genres);
movie_genres_router.put("/:movie_id", updateMovie_genres);
movie_genres_router.delete("/:movie_id", deleteMovie_genres);

export default movie_genres_router;