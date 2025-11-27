import { getAll, getOne, addOne, updateOne, deleteOne, search } from "../models/groups_model.js";
import * as groupMembersModel from '../models/group_members_model.js';

export async function getGroups(req, res, next) {
  try {
    const groups = await getAll();
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

export async function getGroup(req, res, next) {
  try {
    const group = await getOne(req.params.group_id || req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (err) {
    next(err);
  }
}

export async function addGroup(req, res, next) {
  console.log("add called");
  try {
    // Require authenticated user — middleware should have set req.user
    const user = req.user;
    if (!user || !user.user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const payload = {
      user_id: Number(user.user_id),
      group_name: req.body.group_name,
      group_description: req.body.group_description || null,
    };
    const created = await addOne(payload);
    // Add creator as a group member and mark as admin by default
    try {
      await groupMembersModel.addOne({ user_id: Number(user.user_id), group_id: created.group_id, group_admin: true });
    } catch (e) {
      console.warn('Warning: failed to add creator as group member', e);
    }
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateGroup(req, res, next) {
  try {
    const response = await updateOne(req.params.group_id || req.params.id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function searchGroups(req, res, next) {
  try {
    const { q } = req.query;
    const groups = await search(q);
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

export async function deleteGroup(req, res, next) {
  try {
    const group = await deleteOne(req.params.group_id || req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (err) {
    next(err);
  }
}