import express from "express";
import cors from "cors";
import "dotenv/config";

import bookRouter from "./routers/book_router.js";
import favorites_router from "./routers/favorites_router.js";
import genres_router from "./routers/genres_router.js";
import group_members_router from "./routers/group_members_router.js";
import group_messages_router from "./routers/group_messages_router.js";
import group_router from "./routers/group_router.js";
import movie_genres_router from "./routers/movie_genres_router.js";
import movies_router from "./routers/movies_router.js";
import reviews_router from "./routers/reviews_router.js";
import user_router from "./routers/user_router.js";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  res.send("Postgres API esimerkki");
});

app.use("/book", bookRouter);
app.use("/user", user_router);
app.use("/favorites", favorites_router);
app.use("/genres", genres_router);
app.use("/group_members", group_members_router);
app.use("/group_messages", group_messages_router);
app.use("/group", group_router);
app.use("/movie_genres", movie_genres_router);
app.use("/movies", movies_router);
app.use("/reviews", reviews_router);

app.listen(port, () => {
  console.log(`Server is listening port ${port}`);
});
