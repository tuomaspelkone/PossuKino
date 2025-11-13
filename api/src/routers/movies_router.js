import { Router } from "express";
import { getMovies, getMovie, addMovie, updateMovie, deleteMovie } from "../controllers/movies_controller.js";

const movieRouter = Router();

movieRouter.get("/", getMovies);
movieRouter.get("/:movie_id", getMovie);
movieRouter.post("/", addMovie);
movieRouter.put("/:movie_id", updateMovie);
movieRouter.delete("/:movie_id", deleteMovie);

export default movieRouter;
