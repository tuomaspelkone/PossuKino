import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/groups_model.js";

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
    const group = await getOne(req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.jsos(group);
  } catch (err) {
    next(err);
  }
}

export async function addGroup(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateGroup(req, res, next) {
  try {
    const response = await updateOne(req.params.id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteGroup(req, res, next) {
  try {
    const group = await deleteOne(req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (err) {
    next(err);
  }
}