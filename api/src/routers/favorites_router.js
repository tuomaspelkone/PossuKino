import { Router } from "express";
import { getFavorites, getFavorite, addFavorite, updateFavorite, deleteFavorite } from "../controllers/favorites_controller.js";

const favoriteRouter = Router();

favoriteRouter.get("/", getFavorites);
favoriteRouter.get("/:favorite_id", getFavorite);
favoriteRouter.post("/", addFavorite);
favoriteRouter.put("/:favorite_id", updateFavorite);
favoriteRouter.delete("/:favorite_id", deleteFavorite);

export default favoriteRouter;
