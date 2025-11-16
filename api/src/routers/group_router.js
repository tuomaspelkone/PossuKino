import { Router } from "express";
import { getGroups, getGroup, addGroup, updateGroup, deleteGroup, searchGroups } from "../controllers/groups_controller.js";

const group_router = Router();

group_router.get("/search", searchGroups);
group_router.get("/", getGroups);
group_router.get("/:group_id", getGroup);
group_router.post("/", addGroup);
group_router.put("/:group_id", updateGroup);
group_router.delete("/:group_id", deleteGroup);

export default group_router;
