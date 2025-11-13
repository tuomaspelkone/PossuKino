import { Router } from "express";
import { getGenres, getGenre, addGenre, updateGenre, deleteGenre } from "../controllers/genres_controller.js";

const genres_router = Router();

genres_router.get("/", getGenres);
genres_router.get("/:genre_id", getGenre);
genres_router.post("/", addGenre);
genres_router.put("/:genre_id", updateGenre);
genres_router.delete("/:genre_id", deleteGenre);

export default genres_router;