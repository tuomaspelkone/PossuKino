import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/genres_model.js";

export async function getGenres(req, res, next) {
  try {
    const genres = await getAll();
    res.json(genres);
  } catch (err) {
    next(err);
  }
}

export async function getGenre(req, res, next) {
  try {
    const genre = await getOne(req.params.id);
    if (!genre) {
      return res.status(404).json({ error: "Genre not found" });
    }
    res.json(genre);
  } catch (err) {
    next(err);
  }
}

export async function addGenre(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateGenre(req, res, next) {
  try {
    const response = await updateOne(req.params.id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteGenre(req, res, next) {
  try {
    const genre = await deleteOne(req.params.id);
    if (!genre) {
      return res.status(404).json({ error: "Genre not found" });
    }
    res.json(genre);
  } catch (err) {
    next(err);
  }
}