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
  const result = await pool.query(
    "INSERT INTO groups (user_id, group_name, group_description) VALUES($1,$2,$3) RETURNING *",
    [groups.user_id, groups.group_name, groups.group_description]
  );
  return result.rows[0];
}

export async function updateOne(id,groups) {
  console.log("update:"+id);
  const result = await pool.query(
    "UPDATE groups SET group_name=$1, group_description=$2 WHERE group_id=$3 RETURNING *",
    [groups.group_name, groups.group_description, id]
  );
  return result.rows[0];
}


export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM groups WHERE group_id = $1 RETURNING *", [id]);
  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}

export async function search(searchTerm) {
  let query = 'SELECT * FROM groups WHERE 1=1';
  const params = [];

  if (searchTerm) {
    query += ' AND group_name ILIKE $1';
    params.push(`%${searchTerm}%`);
  }

  query += ' ORDER BY group_name';

  const result = await pool.query(query, params);
  return result.rows;
}
