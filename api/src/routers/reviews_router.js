import { Router } from "express";
import { getReviews, getReview, addReview, updateReview, deleteReview } from "../controllers/reviews_controller.js";

const reviews_router = Router();

reviews_router.get("/", getReviews);
reviews_router.get("/:review_id", getReview);
reviews_router.post("/", addReview);
reviews_router.put("/:review_id", updateReview);
reviews_router.delete("/:review_id", deleteReview);

export default reviews_router;