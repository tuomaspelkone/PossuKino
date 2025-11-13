import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM group_messages");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM group_messages WHERE message_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(group_messages) {
  const result = await pool.query(
    "INSERT INTO group_messages (group_id, user_id, message) VALUES($1,$2,$3) RETURNING *",
    [group_messages.group_id, group_messages.user_id, group_messages.message]
  );
  return result.rows;
}

export async function updateOne(id,group_messages) {
  console.log("update:"+id);
  const result = await pool.query(
    "UPDATE group_messages SET group_id=$1, user_id=$2, message=$3 WHERE message_id=$4 RETURNING *",
    [group_messages.group_id, group_messages.user_id, group_messages.message, id]
  );
  return result.rows;
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  const result = await pool.query("DELETE FROM group_messages WHERE message_id = $1 RETURNING *", [id]);
  return result.rows;
}
