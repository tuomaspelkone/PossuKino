import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import bookRouter from "./routers/book_router.js";
import cache_router from "./routers/cache_router.js";
import favorites_router from "./routers/favorites_router.js";
import genres_router from "./routers/genres_router.js";
import group_members_router from "./routers/group_members_router.js";
import group_messages_router from "./routers/group_messages_router.js";
import group_router from "./routers/group_router.js";
import movie_genres_router from "./routers/movie_genres_router.js";
import movies_router from "./routers/movies_router.js";
import reviews_router from "./routers/reviews_router.js";
import user_router from "./routers/user_router.js";
import tmdb_router from "./routers/tmdb_router.js";
import group_movies_router from "./routers/group_movies_router.js";
import upload_router from "./routers/upload_router.js";
import path from "path";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3001;

// CORS-konfiguraatio cookieita varten
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true  // Sallii cookiet
}));

// Static serving for uploaded files - before body parsers
const uploadsDir = path.resolve(process.cwd(), 'uploads');
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
app.use('/uploads', express.static(uploadsDir));

// Upload router BEFORE json/urlencoded parsers to avoid conflicts with multipart
app.use("/upload", upload_router);

// Body parsers for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());  // Cookie parser
app.use("/cache", cache_router);


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
app.use("/tmdb", tmdb_router);
app.use("/group_movies", group_movies_router);

// Ensure group_movies table exists
import db from './database.js';
const ensureTableSql = `CREATE TABLE IF NOT EXISTS group_movies (
  group_movie_id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL,
  tmdb_id TEXT,
  movie_title TEXT,
  movie_image TEXT,
  movie_description TEXT,
  added_reason TEXT,
  added_by INTEGER,
  created_at TIMESTAMP DEFAULT now()
);`;
db.query(ensureTableSql).catch(err => console.error('Failed to ensure group_movies table', err));

// Global JSON error handler to avoid HTML error pages
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`Server is listening port ${port}`);
});
