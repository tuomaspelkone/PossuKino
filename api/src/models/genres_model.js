import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM genres");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM genres WHERE genre_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(genres) {
  const result = await pool.query("INSERT INTO genres (genre_name) VALUES($1)", [genres.genre_name]);
  return result.rows;
}

export async function updateOne(id,genres) {
  console.log("update:"+id);
  const result = await pool.query("UPDATE genres SET name=$1", [genres.genre_name]);
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM genres WHERE genre_id = $1", [id]);
  return result.rows;
}
