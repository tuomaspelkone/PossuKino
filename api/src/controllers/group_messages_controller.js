import { getAll, getOne, addOne, updateOne, deleteOne } from "../models/group_messages_model.js";

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
    const message = await getOne(req.params.id);
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
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function update_group_message(req, res, next) {
  try {
    const response = await updateOne(req.params.id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function delete_group_message(req, res, next) {
  try {
    const message = await deleteOne(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (err) {
    next(err);
  }
}