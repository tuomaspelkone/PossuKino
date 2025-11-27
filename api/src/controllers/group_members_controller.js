import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/group_members_model.js";
import db from '../database.js';

// helper: check if user is admin for a group
async function isUserAdmin(user_id, group_id) {
  const q = await db.query('SELECT * FROM group_members WHERE user_id = $1 AND group_id = $2 AND group_admin = true', [user_id, group_id]);
  return q.rows && q.rows.length > 0;
}

export async function get_group_members(req, res, next) {
  try {
    const group_members = await getAll();
    res.json(group_members);
  } catch (err) {
    next(err);
  }
}

export async function get_group_member(req, res, next) {
  try {
    const id = req.params.member_id || req.params.id;
    const member = await getOne(id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json(member);
  } catch (err) {
    next(err);
  }
}

export async function add_group_member(req, res, next) {
  console.log("add called");
  try {
    const payload = req.body || {};
    const requester = req.user; // requireAuth ensures present
    if (!requester || !requester.user_id) return res.status(401).json({ error: 'Unauthorized' });

    const group_id = Number(payload.group_id);
    if (!group_id) return res.status(400).json({ error: 'group_id required' });

    // If adding by username, require requester to be admin
    if (payload.username) {
      const r = await db.query('SELECT user_id FROM "user" WHERE username = $1', [payload.username]);
      if (!r.rows || r.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      const targetUserId = r.rows[0].user_id;
      const ok = await isUserAdmin(requester.user_id, group_id);
      if (!ok) return res.status(403).json({ error: 'Forbidden' });
      const response = await addOne({ user_id: targetUserId, group_id, group_admin: !!payload.group_admin });
      return res.json(response);
    }

    // If adding by user_id
    if (payload.user_id) {
      const uid = Number(payload.user_id);
      if (uid !== Number(requester.user_id)) {
        // adding someone else -> must be admin
        const ok = await isUserAdmin(requester.user_id, group_id);
        if (!ok) return res.status(403).json({ error: 'Forbidden' });
      }
      const response = await addOne({ user_id: uid, group_id, group_admin: !!payload.group_admin });
      return res.json(response);
    }

    return res.status(400).json({ error: 'user_id or username required' });
  } catch (err) {
    next(err);
  }
}

export async function update_group_member(req, res, next) {
  try {
    const id = req.params.member_id || req.params.id;
    const response = await updateOne(id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function delete_group_member(req, res, next) {
  try {
    const id = req.params.member_id || req.params.id;
    const requester = req.user;
    if (!requester || !requester.user_id) return res.status(401).json({ error: 'Unauthorized' });

    const member = await getOne(id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // allow self-remove
    if (Number(member.user_id) !== Number(requester.user_id)) {
      // otherwise require admin in that group
      const ok = await isUserAdmin(requester.user_id, member.group_id);
      if (!ok) return res.status(403).json({ error: 'Forbidden' });
    }

    const deleted = await deleteOne(id);
    if (!deleted) return res.status(404).json({ error: 'Member not found' });
    res.json(deleted);
  } catch (err) {
    next(err);
  }
}