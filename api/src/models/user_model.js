import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM user");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM user WHERE user_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(user) {
  const result = await pool.query("INSERT INTO user (username, email, password, refresh_token) VALUES($1,$2,$3,$4)", [user.username, user.email, user.password, user.refresh_token]);
  return result.rows;
}

export async function updateOne(id,user) {
  console.log("update:"+id);
  const result = await pool.query("UPDATE book SET username=$1, email=$2, password=$3, refresh_token=$4", [user.username, user.email, user.password, user.refresh_token]);
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM user WHERE user_id = $1", [id]);
  return result.rows;
}
