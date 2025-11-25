import { Router } from "express";
import { getGroups, getGroup, addGroup, updateGroup, deleteGroup, searchGroups } from "../controllers/groups_controller.js";
import { requireAuth } from "../middleware/auth.js";

const group_router = Router();

group_router.get("/search", searchGroups);
group_router.get("/", getGroups);
group_router.get("/:group_id", getGroup);
// protect creation: user must be authenticated
group_router.post("/", requireAuth, addGroup);
group_router.put("/:group_id", updateGroup);
group_router.delete("/:group_id", deleteGroup);

export default group_router;
