import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM movie");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM movie WHERE movie_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(movie) {
  const result = await pool.query("INSERT INTO movie (movie_title, movie_image, movie_description, movie_certication) VALUES($1,$2,$3,$4)", [movie.movie_title, movie.movie_image, movie.movie_description, movie.movie_certication]);
  return result.rows;
}

export async function updateOne(id,movie) {
  console.log("update:"+id);
  const result = await pool.query("UPDATE movie SET movie_title=$1, movie_image=$2, movie_description=$3, movie_certication=$4" , [movie.movie_title, movie.movie_image, movie.movie_description, movie.movie_certication]);
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+movie_id);
  const result = await pool.query("DELETE FROM movie WHERE movie_id = $1", [id]);
  return result.rows;
}
