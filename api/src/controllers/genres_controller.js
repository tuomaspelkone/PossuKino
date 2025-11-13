import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/genres_model.js";

export async function getGenres(req, res, next) {
  try {
    const genres = await getAll();
    res.json(genres);
  } catch (err) {
    next(err);
  }
}

export async function getGenres(req, res, next) {
  try {
    const genres = await getOne(req.params.genre_id);
    if (!genres) {
      return res.status(404).json({ error: "Genres not found" });
    }
    res.json(genres);
  } catch (err) {
    next(err);
  }
}

export async function addGenres(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateGenres(req, res, next) {
  try {
    const response = await updateOne(req.params.genre_id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteGenres(req, res, next) {
  try {
    const genres = await deleteOne(req.params.genre_id);
    if (!genres) {
      return res.status(404).json({ error: "Genres not found" });
    }
    res.json(genres);
  } catch (err) {
    next(err);
  }
}