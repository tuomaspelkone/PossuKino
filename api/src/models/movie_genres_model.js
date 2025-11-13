import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM movie_genres");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM movie_genres WHERE movie_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(movie_genres) {
  const result = await pool.query("INSERT INTO movie_genres (movie_id,genre_id) VALUES($1,$2,)", [movie_genres.movie_id, movie_genres.genre_id]);
  return result.rows;
}

export async function updateOne(id,movie_genres) {
  console.log("update:"+id);
  const result = await pool.query("UPDATE movie_genres SET movie_id=$1, genre_id=$2", [movie_genres.movie_id, movie_genres.genre_id]);
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM movie_genres WHERE movie_id = $1", [id]);
  return result.rows;
}