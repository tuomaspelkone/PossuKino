import { Router } from "express";
import { getUsers, getUser, addUser, updateUser, deleteUser, register, login } from "../controllers/user_controller.js";

const user_router = Router();

user_router.post("/register", register);
user_router.post("/login", login);
user_router.get("/", getUsers);
user_router.get("/:id", getUser);
user_router.post("/", addUser);
user_router.put("/:id", updateUser);
user_router.delete("/:id", deleteUser);

export default user_router;
