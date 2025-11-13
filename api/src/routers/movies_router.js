import { Router } from "express";
import { getMovies, getMovie, addMovie, updateMovie, deleteMovie } from "../controllers/movies_controller.js";

const movie_router = Router();

movie_router.get("/", getMovies);
movie_router.get("/:movie_id", getMovie);
movie_router.post("/", addMovie);
movie_router.put("/:movie_id", updateMovie);
movie_router.delete("/:movie_id", deleteMovie);

export default movie_router;
