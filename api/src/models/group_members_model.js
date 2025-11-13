import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM group_members");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM group_members WHERE member_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(group_members) {
  const result = await pool.query("INSERT INTO group_members (user_id, group_id, group_admin) VALUES($1,$2,$3)", [group_members.user_id, group_members.group_id, group_members.group_admin]);
  return result.rows;
}

export async function updateOne(id,group_members) {
  console.log("update:"+id);
  const result = await pool.query("UPDATE group_members SET user_id=$1, group_id=$2, group_admin=$3", [group_members.user_id, group_members.group_id, group_members.group_admin]);
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM group_members WHERE member_id = $1", [id]);
  return result.rows;
}
