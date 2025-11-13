import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM groups");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM groups WHERE group_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(groups) {
  const result = await pool.query("INSERT INTO groups (group_id,  group_name, group_description) VALUES($1,$2,$3)", [groups.group_name,  groups.group_description]);
  return result.rows;
}

export async function updateOne(id,groups) {
  console.log("update:"+id);
  const result = await pool.query("UPDATE groups SET group_name=$1 WHERE id=$2", [groups.group_name,  groups.group_description]);
  return result.rows;
}


export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM groups WHERE group_id = $1", [id]);
  return result.rows;
}
