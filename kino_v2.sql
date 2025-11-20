-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS "group_messages" CASCADE;
DROP TABLE IF EXISTS "group_members" CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS movie_genres CASCADE;
DROP TABLE IF EXISTS genres CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    refresh_token TEXT
);

-- Movies table: only stores tmdb_id as PRIMARY KEY
-- All other movie data (title, image, description, etc.) are fetched from TMDB API
CREATE TABLE movies (
    tmdb_id INTEGER PRIMARY KEY
);

CREATE TABLE genres (
    genre_id SERIAL PRIMARY KEY,
    genre_name VARCHAR(100) UNIQUE NOT NULL
);

-- movie_genres: foreign key now references tmdb_id instead of movie_id
CREATE TABLE movie_genres (
    tmdb_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (tmdb_id, genre_id),
    FOREIGN KEY (tmdb_id) REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE
);

-- reviews: stores user reviews for TMDB movies (project-specific data)
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    tmdb_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tmdb_id) REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- favorites: stores user's favorite TMDB movies (project-specific data)
CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tmdb_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tmdb_id),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tmdb_id) REFERENCES movies(tmdb_id) ON DELETE CASCADE
);

CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    group_description VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

CREATE TABLE "group_members" (
    member_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    group_admin BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

CREATE TABLE "group_messages" (
    message_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- Indices for performance
CREATE INDEX idx_reviews_movie ON reviews(tmdb_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_movie ON favorites(tmdb_id);
CREATE INDEX idx_group_members_group ON "group_members"(group_id);
CREATE INDEX idx_group_messages_group ON "group_messages"(group_id);
CREATE INDEX idx_movie_genres_movie ON movie_genres(tmdb_id);
CREATE INDEX idx_movie_genres_genre ON movie_genres(genre_id);

-- Sample data for testing (using TMDB IDs: https://www.themoviedb.org/)
-- NOTE: These are placeholder TMDB IDs — replace with real ones from TMDB API
INSERT INTO "user" (user_id, username, email, password) VALUES
(1, 'matti', 'matti@example.com', '$2b$10$hashedpassword1'),
(2, 'liisa', 'liisa@example.com', '$2b$10$hashedpassword2'),
(3, 'pekka', 'pekka@example.com', '$2b$10$hashedpassword3');

-- Reset user_id sequence to correct value
SELECT setval('user_user_id_seq', (SELECT MAX(user_id) FROM "user"));

INSERT INTO genres (genre_name) VALUES
('Action'),
('Comedy'),
('Drama'),
('Sci-Fi'),
('Horror'),
('Romance'),
('Thriller');

-- Insert only TMDB IDs (no other movie data stored locally)
-- Real TMDB IDs: https://www.themoviedb.org/
INSERT INTO movies (tmdb_id) VALUES
(603),      -- The Matrix
(27205),    -- Inception
(278),      -- The Shawshank Redemption
(680),      -- Pulp Fiction
(155);      -- The Dark Knight

INSERT INTO movie_genres (tmdb_id, genre_id) VALUES
(603, 1), (603, 4), -- Matrix: Action, Sci-Fi
(27205, 1), (27205, 4), (27205, 7), -- Inception: Action, Sci-Fi, Thriller
(278, 3), -- Shawshank: Drama
(680, 3), (680, 7), -- Pulp Fiction: Drama, Thriller
(155, 1), (155, 3), (155, 7); -- Dark Knight: Action, Drama, Thriller

INSERT INTO reviews (tmdb_id, user_id, rating, review_text) VALUES
(603, 1, 5, 'Mind-blowing! Best sci-fi movie ever.'),
(603, 2, 4, 'Great action and concept, but a bit confusing.'),
(27205, 1, 5, 'Christopher Nolan is a genius!'),
(278, 2, 5, 'Absolutely perfect. A masterpiece.'),
(680, 3, 4, 'Tarantino at his best.'),
(155, 1, 5, 'Heath Ledger was phenomenal as Joker.');

INSERT INTO favorites (user_id, tmdb_id) VALUES
(1, 603),
(1, 27205),
(1, 155),
(2, 603),
(2, 278),
(3, 680);

INSERT INTO groups (user_id, group_name, group_description) VALUES
(1, 'Sci-Fi Lovers', 'Group for science fiction movie enthusiasts'),
(2, 'Classic Movies', 'Discussing timeless cinema');

INSERT INTO group_members (group_id, user_id, group_admin) VALUES
(1, 1, true),
(1, 2, false),
(2, 2, true),
(2, 3, false);

INSERT INTO "group_messages" (group_id, user_id, message) VALUES
(1, 1, 'Who wants to discuss The Matrix tonight?'),
(1, 2, 'Count me in!'),
(2, 2, 'Just rewatched Shawshank Redemption, still a masterpiece.'),
(2, 3, 'Agreed, one of the best movies ever made.');

-- Test query
curl "http://localhost:3001/tmdb/search?q=Inception"
