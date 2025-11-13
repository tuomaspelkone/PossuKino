import { Router } from "express";
import { getFavorites, getFavorite, addFavorite, updateFavorite, deleteFavorite } from "../controllers/favorites_controller.js";

const favorite_router = Router();

favorite_router.get("/", getFavorites);
favorite_router.get("/:favorite_id", getFavorite);
favorite_router.post("/", addFavorite);
favorite_router.put("/:favorite_id", updateFavorite);
favorite_router.delete("/:favorite_id", deleteFavorite);

export default favorite_router;
