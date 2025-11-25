import db from '../database.js';

export async function findByGroup(group_id) {
  const res = await db.query('SELECT * FROM group_movies WHERE group_id = $1 ORDER BY created_at DESC', [group_id]);
  return res.rows || [];
}

export async function addOne({ group_id, tmdb_id, movie_title, movie_image, movie_description, added_reason, added_by }) {
  const res = await db.query(
    `INSERT INTO group_movies (group_id, tmdb_id, movie_title, movie_image, movie_description, added_reason, added_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [group_id, tmdb_id, movie_title, movie_image, movie_description, added_reason, added_by]
  );
  return res.rows[0];
}

export default { findByGroup, addOne };
