import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/favorites_model.js";

export async function getFavorites(req, res, next) {
  try {
    const favorites = await getAll();
    res.json(favorites);
  } catch (err) {
    next(err);
  }
}

export async function getFavorite(req, res, next) {
  try {
    const favorite = await getOne(req.params.id);
    if (!favorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    res.json(favorite);
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateFavorite(req, res, next) {
  try {
    const response = await updateOne(req.params.id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteFavorite(req, res, next) {
  try {
    const favorite = await deleteOne(req.params.id);
    if (!favorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    res.json(favorite);
  } catch (err) {
    next(err);
  }
}