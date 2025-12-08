import { Router } from "express";
import { get_group_messages, get_group_message, add_group_message, update_group_message, delete_group_message } from "../controllers/group_messages_controller.js";
import { requireAuth } from '../middleware/auth.js';

const group_messages_router = Router();

group_messages_router.get("/", get_group_messages);
group_messages_router.get("/:message_id", get_group_message);
// protect create/update/delete operations
group_messages_router.post("/", requireAuth, add_group_message);
group_messages_router.put("/:message_id", requireAuth, update_group_message);
group_messages_router.delete("/:message_id", requireAuth, delete_group_message);

export default group_messages_router;
