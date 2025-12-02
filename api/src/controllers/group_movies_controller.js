import * as model from '../models/group_movies_model.js';
import db from '../database.js';

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
    // Debug logging: show incoming payload and authenticated user
    try { console.log('addGroupMovie called, payload:', JSON.stringify(payload), 'user:', JSON.stringify(req.user)); } catch (e) { console.log('addGroupMovie called'); }
    const group_id = Number(payload.group_id);
    if (!group_id) return res.status(400).json({ error: 'group_id required' });
    const tmdb_id = payload.tmdb_id || payload.movie_id || payload.id || null;
    const movie_title = payload.movie_title || payload.title || payload.name || null;
    const movie_image = payload.movie_image || payload.poster_path || null;
    const movie_description = payload.movie_description || payload.overview || null;
    const added_reason = payload.added_reason || null;
    const added_by = req.user ? Number(req.user.user_id) : null;

    // verify that requester is a member of the group
    if (!added_by) return res.status(401).json({ error: 'Unauthorized' });
    const membership = await db.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2', [group_id, added_by]);
    if (!membership || !membership.rows || membership.rows.length === 0) {
      return res.status(403).json({ error: 'Only group members may add movies' });
    }

    const created = await model.addOne({ group_id, tmdb_id, movie_title, movie_image, movie_description, added_reason, added_by });
    return res.status(201).json(created);
  } catch (err) {
    console.error('addGroupMovie error', err);
    return res.status(500).json({ error: 'server error' });
  }
}

export async function deleteGroupMovie(req, res) {
  try {
    const id = Number(req.params.group_movie_id || req.params.id);
    if (!id) return res.status(400).json({ error: 'group_movie_id required' });

    // must be authenticated
    const user = req.user;
    if (!user || !user.user_id) return res.status(401).json({ error: 'Unauthorized' });

    // find the movie row
    const gm = await model.findById(id);
    if (!gm) return res.status(404).json({ error: 'Not found' });

    // allow deletion if requester is the one who added the movie
    const requesterId = Number(user.user_id);
    if (gm.added_by && Number(gm.added_by) === requesterId) {
      // owner -> allowed
    } else {
      // otherwise require admin in that group
      const q = await db.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND group_admin = true', [gm.group_id, requesterId]);
      if (!q.rows || q.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    }

    const deleted = await model.deleteById(id);
    return res.json(deleted);
  } catch (err) {
    console.error('deleteGroupMovie error', err);
    return res.status(500).json({ error: 'server error' });
  }
}

export default { getGroupMovies, addGroupMovie, deleteGroupMovie };
