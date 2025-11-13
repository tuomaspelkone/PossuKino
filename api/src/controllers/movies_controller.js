import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/movies_model.js";

export async function getMovies(req, res, next) {
  try {
    const movies = await getAll();
    res.json(movies);
  } catch (err) {
    next(err);
  }
}

export async function getMovie(req, res, next) {
  try {
    const id = req.params.movie_id || req.params.id;
    const movie = await getOne(id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(movie);
  } catch (err) {
    next(err);
  }
}

export async function addMovie(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateMovie(req, res, next) {
  try {
    const id = req.params.movie_id || req.params.id;
    const response = await updateOne(id, req.body);
    res.json(Array.isArray(response) && response.length > 0 ? response[0] : response);
  } catch (err) {
    next(err);
  }
}

export async function deleteMovie(req, res, next) {
  try {
    const id = req.params.movie_id || req.params.id;
    const movie = await deleteOne(id);
    if (!Array.isArray(movie) || movie.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(movie[0]);
  } catch (err) {
    next(err);
  }
}