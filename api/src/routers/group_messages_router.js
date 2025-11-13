import { Router } from "express";
import { get_group_messages, get_group_message, add_group_message, update_group_message, delete_group_message } from "../controllers/group_messages_controller.js";

const group_messages_router = Router();

group_messages_router.get("/", get_group_messages);
group_messages_router.get("/:message_id", get_group_message);
group_messages_router.post("/", add_group_message);
group_messages_router.put("/:message_id", update_group_message);
group_messages_router.delete("/:message_id", delete_group_message);

export default group_messages_router;
