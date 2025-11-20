import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM reviews");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM reviews WHERE review_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}
export async function addOne(reviews) {
  const result = await pool.query("INSERT INTO reviews (tmdb_id, user_id, rating, review_text) VALUES($1,$2,$3,$4) RETURNING *", [reviews.tmdb_id, reviews.user_id, reviews.rating, reviews.review_text]);
  return result.rows;
}

export async function updateOne(id,reviews) {
  console.log("update:"+id);
  const result = await pool.query("UPDATE reviews SET tmdb_id=$1, user_id=$2, rating=$3, review_text=$4 WHERE review_id=$5 RETURNING *", [reviews.tmdb_id, reviews.user_id, reviews.rating, reviews.review_text, id]);
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM reviews WHERE review_id = $1", [id]);
  return result.rows;
}
