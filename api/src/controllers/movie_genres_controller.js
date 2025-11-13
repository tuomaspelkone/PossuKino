import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/movie_genres_model.js";

export async function getMovie_genres(req, res, next) {
  try {
    const movie_genres = await getAll();
    res.json(movie_genres);
  } catch (err) {
    next(err);
  }
}

export async function getMovie_genres(req, res, next) {
  try {
    const movie_genres = await getOne(req.params.movie_id);
    if (!movie_genres) {
      return res.status(404).json({ error: "Movie_genres not found" });
    }
    res.json(movie_genres);
  } catch (err) {
    next(err);
  }
}

export async function addMovie_genres(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateMovie_genres(req, res, next) {
  try {
    const response = await updateOne(req.params.movie_id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteMovie_genres(req, res, next) {
  try {
    const movie_genres = await deleteOne(req.params.movie_id);
    if (!movie_genres) {
      return res.status(404).json({ error: "Movie_genres not found" });
    }
    res.json(movie_genres);
  } catch (err) {
    next(err);
  }
}