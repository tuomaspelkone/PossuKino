import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/group_members_model.js";

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
    const member = await getOne(req.params.member_id);
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
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function update_group_member(req, res, next) {
  try {
    const response = await updateOne(req.params.member_id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function delete_group_member(req, res, next) {
  try {
    const member = await deleteOne(req.params.member_id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json(member);
  } catch (err) {
    next(err);
  }
}