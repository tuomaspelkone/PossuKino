import * as model from '../models/group_movies_model.js';

export async function getGroupMovies(req, res) {
  try {
    const group_id = Number(req.query.group_id || req.params.group_id);
    if (!group_id) return res.status(400).json({ error: 'group_id required' });
    const rows = await model.findByGroup(group_id);
    return res.json(rows);
  } catch (err) {
    console.error('getGroupMovies error', err);
    return res.status(500).json({ error: 'server error' });
  }
}

export async function addGroupMovie(req, res) {
  try {
    const payload = req.body || {};
    const group_id = Number(payload.group_id);
    if (!group_id) return res.status(400).json({ error: 'group_id required' });
    const tmdb_id = payload.tmdb_id || payload.movie_id || payload.id || null;
    const movie_title = payload.movie_title || payload.title || payload.name || null;
    const movie_image = payload.movie_image || payload.poster_path || null;
    const movie_description = payload.movie_description || payload.overview || null;
    const added_reason = payload.added_reason || null;
    const added_by = req.user ? Number(req.user.user_id) : null;

    const created = await model.addOne({ group_id, tmdb_id, movie_title, movie_image, movie_description, added_reason, added_by });
    return res.status(201).json(created);
  } catch (err) {
    console.error('addGroupMovie error', err);
    return res.status(500).json({ error: 'server error' });
  }
}

export default { getGroupMovies, addGroupMovie };
