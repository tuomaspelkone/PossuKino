import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM favorites");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM favorites WHERE favorite_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(favorite) {
  const result = await pool.query(
    "INSERT INTO favorites (user_id, movie_id) VALUES($1,$2) RETURNING *",
    [favorite.user_id, favorite.movie_id]
  );
  return result.rows;
}

export async function updateOne(id,favorite) {
  console.log("update:"+id);
  const result = await pool.query(
    "UPDATE favorites SET user_id=$1, movie_id=$2 WHERE favorite_id=$3 RETURNING *",
    [favorite.user_id, favorite.movie_id, id]
  );
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM favorites WHERE favorite_id = $1 RETURNING *", [id]);
  return result.rows;
}
