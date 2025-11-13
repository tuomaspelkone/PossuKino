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
  const result = await pool.query("INSERT INTO reviews (rating, review_text) VALUES($1,$2)", [reviews.rating, reviews.review_text]);
  return result.rows;
}

export async function updateOne(id,reviews) {
  console.log("update:"+id);
  const result = await pool.query("UPDATE reviews SET rating=$1, review_text=$2", [reviews.rating, reviews.review_text]);
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM reviews WHERE review_id = $1", [id]);
  return result.rows;
}
