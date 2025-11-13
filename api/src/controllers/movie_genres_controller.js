import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/movie_genres_model.js";

export async function getMovie_genres(req, res, next) {
  try {
    const movie_genres = await getAll();
    res.json(movie_genres);
  } catch (err) {
    next(err);
  }
}

export async function getMovie_genre(req, res, next) {
  try {
    const movie_genre = await getOne(req.params.movie_id);
    if (!movie_genre) {
      return res.status(404).json({ error: "Movie_genre not found" });
    }
    res.json(movie_genre);
  } catch (err) {
    next(err);
  }
}

export async function addMovie_genre(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateMovie_genre(req, res, next) {
  try {
    const response = await updateOne(req.params.movie_id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteMovie_genre(req, res, next) {
  try {
    const movie_genre = await deleteOne(req.params.movie_id);
    if (!movie_genre) {
      return res.status(404).json({ error: "Movie_genre not found" });
    }
    res.json(movie_genre);
  } catch (err) {
    next(err);
  }
}