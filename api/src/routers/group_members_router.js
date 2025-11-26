import { Router } from "express";
import { get_group_members, get_group_member, add_group_member, update_group_member, delete_group_member } from "../controllers/group_members_controller.js";
import { requireAuth } from '../middleware/auth.js';

const group_members_router = Router();

group_members_router.get("/", get_group_members);
group_members_router.get("/:member_id", get_group_member);
// protect add/update/delete operations
group_members_router.post("/", requireAuth, add_group_member);
group_members_router.put("/:member_id", requireAuth, update_group_member);
group_members_router.delete("/:member_id", requireAuth, delete_group_member);

export default group_members_router;
