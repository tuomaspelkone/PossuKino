import { Router } from "express";
import { getGenres, getGenres, addGenres, updateGenres, deleteGenres } from "../controllers/genres_controller.js";

const genres_router = Router();

genres_router.get("/", getGenres);
genres_router.get("/:id", getGenres);
genres_router.post("/", addGenres);
genres_router.put("/:id", updateGenres);
genres_router.delete("/:id", deleteGenres);

export default genres_router;