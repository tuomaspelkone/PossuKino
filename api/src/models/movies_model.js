import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM movies");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM movies WHERE movie_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(movie) {
  const result = await pool.query(
    "INSERT INTO movies (movie_title, movie_image, movie_description, movie_certification) VALUES($1,$2,$3,$4) RETURNING *",
    [movie.movie_title, movie.movie_image, movie.movie_description, movie.movie_certification]
  );
  return result.rows;
}

export async function updateOne(id,movie) {
  console.log("update:"+id);
  const result = await pool.query(
    "UPDATE movies SET movie_title=$1, movie_image=$2, movie_description=$3, movie_certification=$4 WHERE movie_id=$5 RETURNING *",
    [movie.movie_title, movie.movie_image, movie.movie_description, movie.movie_certification, id]
  );
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM movies WHERE movie_id = $1 RETURNING *", [id]);
  return result.rows;
}
