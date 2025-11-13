import { Router } from "express";
import { getReviews, getReviews, addReviews, updateReviews, deleteReviews } from "../controllers/reviews_controller.js";

const reviews_router = Router();

reviews_router.get("/", getReviews);
reviews_router.get("/:review_id", getReviews);
reviews_router.post("/", addReviews);
reviews_router.put("/:review_id", updateReviews);
reviews_router.delete("/:review_id", deleteReviews);

export default reviews_router;