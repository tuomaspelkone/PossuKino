import db from '../database.js';

export async function findByGroup(group_id) {
  const res = await db.query(
    `SELECT gm.*, u.username AS added_by_username, gmbr.group_admin AS added_by_is_admin,
            (gmbr.user_id IS NOT NULL) AS added_by_is_member
     FROM group_movies gm
     LEFT JOIN "user" u ON gm.added_by = u.user_id
     LEFT JOIN group_members gmbr ON gmbr.group_id = gm.group_id AND gmbr.user_id = gm.added_by
     WHERE gm.group_id = $1
     ORDER BY gm.created_at DESC`,
    [group_id]
  );
  return res.rows || [];
}

export async function addOne({ group_id, tmdb_id, movie_title, movie_image, movie_description, added_reason, added_by }) {
  const res = await db.query(
    `WITH ins AS (
       INSERT INTO group_movies (group_id, tmdb_id, movie_title, movie_image, movie_description, added_reason, added_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
     )
     SELECT ins.*, u.username AS added_by_username
     FROM ins
     LEFT JOIN "user" u ON ins.added_by = u.user_id`,
    [group_id, tmdb_id, movie_title, movie_image, movie_description, added_reason, added_by]
  );
  return res.rows[0];
}

export async function findById(group_movie_id) {
  const res = await db.query(
    `SELECT * FROM group_movies WHERE group_movie_id = $1`,
    [group_movie_id]
  );
  return res.rows && res.rows.length > 0 ? res.rows[0] : null;
}

export async function deleteById(group_movie_id) {
  const res = await db.query(
    `DELETE FROM group_movies WHERE group_movie_id = $1 RETURNING *`,
    [group_movie_id]
  );
  return res.rows && res.rows.length > 0 ? res.rows[0] : null;
}

export default { findByGroup, addOne };
