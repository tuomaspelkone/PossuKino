import pool from "../database.js";

export async function getAll() {
  const result = await pool.query("SELECT * FROM movies");
  return result.rows; 
}

export async function getOne(id) {
  const result = await pool.query("SELECT * FROM movies WHERE tmdb_id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function addOne(movie) {
  // Only store tmdb_id
  const result = await pool.query(
    "INSERT INTO movies (tmdb_id) VALUES($1) ON CONFLICT (tmdb_id) DO NOTHING RETURNING *",
    [movie.tmdb_id]
  );
  return result.rows;
}

export async function updateOne(id,movie) {
  // movies table only has tmdb_id, nothing to update
  console.log("movies table is immutable (only stores tmdb_id)");
  return [];
}

export async function deleteOne(id) {
  const result = await pool.query("DELETE FROM movies WHERE tmdb_id = $1 RETURNING *", [id]);
  return result.rows;
}

export async function search(searchTerm, genreIds, certification) {
  // Local search: only available for movies in local genres
  let query = `
    SELECT DISTINCT m.* 
    FROM movies m
    LEFT JOIN movie_genres mg ON m.tmdb_id = mg.tmdb_id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  // Note: searchTerm not available locally since we don't store movie names
  // Only genre and certification filtering possible

  if (genreIds && genreIds.length > 0) {
    query += ` AND mg.genre_id = ANY($${paramIndex}::int[])`;
    params.push(genreIds);
    paramIndex++;
  }

  query += ` ORDER BY m.tmdb_id`;

  const result = await pool.query(query, params);
  return result.rows;
}
