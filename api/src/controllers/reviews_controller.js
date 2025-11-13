import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/reviws_model.js";

export async function getReviews(req, res, next) {
  try {
    const reviews = await getAll();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function getReviews(req, res, next) {
  try {
    const reviews = await getOne(req.params.review_id);
    if (!reviews) {
      return res.status(404).json({ error: "reviews not found" });
    }
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function addReviews(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateReviews(req, res, next) {
  try {
    const response = await updateOne(req.params.review_id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteReviews(req, res, next) {
  try {
    const reviews = await deleteOne(req.params.review_id);
    if (!reviews) {
      return res.status(404).json({ error: "Reviews not found" });
    }
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}