import { Router } from "express";
import { getGroups, getGroup, addGroup, updateGroup, deleteGroup } from "../controllers/groups_controller.js";

const groupRouter = Router();

groupRouter.get("/", getGroups);
groupRouter.get("/:group_id", getGroup);
groupRouter.post("/", addGroup);
groupRouter.put("/:group_id", updateGroup);
groupRouter.delete("/:group_id", deleteGroup);

export default groupRouter;
