import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM favorite");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM favorite WHERE favorite_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(favorite) {
  const result = await pool.query("INSERT INTO favorite (user_id, movie_id) VALUES($1,$2)", [Favorites.user_id, Favorites.movie_id]);
  return result.rows;
}

export async function updateOne(id,favorite) {
  console.log("update:"+id);
  const result = await pool.query("UPDATE favorite SET user_id=$1, movie_id=$2, ", [Favorites.user_id, Favorites.movie_id]);
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM favorite WHERE favorite_id = $1", [id]);
  return result.rows;
}
