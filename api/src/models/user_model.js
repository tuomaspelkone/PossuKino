import pool from "../database.js";

export async function getAll() {
  const result = await pool.query('SELECT * FROM "user"');
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query('SELECT * FROM "user" WHERE user_id = $1', [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(user) {
  const result = await pool.query(
    'INSERT INTO "user" (username, email, password) VALUES($1,$2,$3) RETURNING *', 
    [user.username, user.email, user.password]
  );
  return result.rows[0];
}

export async function updateOne(id,user) {
  console.log("update:"+id);
  const result = await pool.query('UPDATE "user" SET username=$1, email=$2, password=$3, refresh_token=$4 WHERE user_id=$5', [user.username, user.email, user.password, user.refresh_token, id]);
  return result.rows;
}

async function ensureDeletedUsersTable() {
  const sql = `CREATE TABLE IF NOT EXISTS deleted_user (
    id serial PRIMARY KEY,
    original_user_id integer,
    username text,
    email text,
    password text,
    refresh_token text,
    deleted_at timestamptz DEFAULT now()
  )`;
  await pool.query(sql);
}

export async function deleteOne(id) {
  console.log("delete:"+id);
  // Archive then delete in a transaction
  await ensureDeletedUsersTable();
  try {
    await pool.query('BEGIN');

    const sel = await pool.query('SELECT * FROM "user" WHERE user_id = $1', [id]);
    if (sel.rows.length === 0) {
      await pool.query('ROLLBACK');
      return null;
    }
    const user = sel.rows[0];

    const insert = await pool.query(
      'INSERT INTO deleted_user (original_user_id, username, email, password, refresh_token) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [user.user_id, user.username, user.email, user.password, user.refresh_token]
    );

    await pool.query('DELETE FROM "user" WHERE user_id = $1', [id]);

    await pool.query('COMMIT');
    return insert.rows[0];
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }
}

export async function getDeletedOne(originalId) {
  const result = await pool.query('SELECT * FROM deleted_user WHERE original_user_id = $1 ORDER BY deleted_at DESC LIMIT 1', [originalId]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
  return result.rows.length > 0 ? result.rows[0] : null;
}
