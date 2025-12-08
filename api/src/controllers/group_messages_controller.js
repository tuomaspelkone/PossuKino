import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/group_messages_model.js";
import db from '../database.js';

export async function get_group_messages(req, res, next) {
  try {
    const group_messages = await getAll();
    res.json(group_messages);
  } catch (err) {
    next(err);
  }
}

export async function get_group_message(req, res, next) {
  try {
    const id = req.params.message_id || req.params.id;
    const message = await getOne(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (err) {
    next(err);
  }
}

export async function add_group_message(req, res, next) {
  console.log("add called");
  try {
    const payload = req.body || {};
    const requester = req.user;
    if (!requester || !requester.user_id) return res.status(401).json({ error: 'Unauthorized' });
    const group_id = Number(payload.group_id);
    if (!group_id) return res.status(400).json({ error: 'group_id required' });

    // ensure requester is a member of the group
    const membership = await db.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2', [group_id, requester.user_id]);
    if (!membership || !membership.rows || membership.rows.length === 0) {
      return res.status(403).json({ error: 'Only group members may post messages' });
    }

    // basic validation
    const user_id = Number(payload.user_id || requester.user_id);
    const message = (payload.message || '').toString().trim();
    if (!message) return res.status(400).json({ error: 'message required' });

    const response = await addOne({ group_id, user_id, message });
    res.status(201).json(response && response[0] ? response[0] : response);
  } catch (err) {
    console.error('add_group_message error', err);
    next(err);
  }
}

export async function update_group_message(req, res, next) {
  try {
    const id = req.params.message_id || req.params.id;
    const response = await updateOne(id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function delete_group_message(req, res, next) {
  try {
    const id = req.params.message_id || req.params.id;
    const message = await deleteOne(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (err) {
    next(err);
  }
}