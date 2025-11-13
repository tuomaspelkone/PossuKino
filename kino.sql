CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    refresh_token TEXT
);

CREATE TABLE movies (
    movie_id SERIAL PRIMARY KEY,
    movie_title VARCHAR(255) NOT NULL,
    movie_image VARCHAR(255),
    movie_description TEXT,
    movie_certification VARCHAR(100)
);

CREATE TABLE genres (
    genre_id SERIAL PRIMARY KEY,
    genre_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE movie_genres (
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    movie_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    UNIQUE(user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE
);

CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    group_description VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

CREATE TABLE "groupMembers" (
    member_id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    group_admin BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

CREATE TABLE "groupMessages" (
    message_id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_movie ON reviews(movie_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_movie ON favorites(movie_id);
CREATE INDEX idx_group_members_group ON "groupMembers"(group_id);
CREATE INDEX idx_group_messages_group ON "groupMessages"(group_id);
CREATE INDEX idx_movie_genres_movie ON movie_genres(movie_id);
CREATE INDEX idx_movie_genres_genre ON movie_genres(genre_id);

-- Sample data for testing
INSERT INTO "user" (username, email, password) VALUES
('matti', 'matti@example.com', '$2b$10$hashedpassword1'),
('liisa', 'liisa@example.com', '$2b$10$hashedpassword2'),
('pekka', 'pekka@example.com', '$2b$10$hashedpassword3');

INSERT INTO genres (genre_name) VALUES
('Action'),
('Comedy'),
('Drama'),
('Sci-Fi'),
('Horror'),
('Romance'),
('Thriller');

INSERT INTO movies (movie_title, movie_image, movie_description, movie_certification) VALUES
('The Matrix', 'matrix.jpg', 'A computer hacker learns about the true nature of reality.', 'PG-13'),
('Inception', 'inception.jpg', 'A thief who steals corporate secrets through dream-sharing technology.', 'PG-13'),
('The Shawshank Redemption', 'shawshank.jpg', 'Two imprisoned men bond over years, finding redemption.', 'R'),
('Pulp Fiction', 'pulp.jpg', 'Various interconnected stories of criminals in Los Angeles.', 'R'),
('The Dark Knight', 'batman.jpg', 'Batman faces the Joker in Gotham City.', 'PG-13');

INSERT INTO movie_genres (movie_id, genre_id) VALUES
(1, 1), (1, 4), -- Matrix: Action, Sci-Fi
(2, 1), (2, 4), (2, 7), -- Inception: Action, Sci-Fi, Thriller
(3, 3), -- Shawshank: Drama
(4, 3), (4, 7), -- Pulp Fiction: Drama, Thriller
(5, 1), (5, 3), (5, 7); -- Dark Knight: Action, Drama, Thriller

INSERT INTO reviews (movie_id, user_id, rating, review_text) VALUES
(1, 1, 5, 'Mind-blowing! Best sci-fi movie ever.'),
(1, 2, 4, 'Great action and concept, but a bit confusing.'),
(2, 1, 5, 'Christopher Nolan is a genius!'),
(3, 2, 5, 'Absolutely perfect. A masterpiece.'),
(4, 3, 4, 'Tarantino at his best.'),
(5, 1, 5, 'Heath Ledger was phenomenal as Joker.');

INSERT INTO favorites (user_id, movie_id) VALUES
(1, 1),
(1, 2),
(1, 5),
(2, 1),
(2, 3),
(3, 4);

INSERT INTO groups (user_id, group_name, group_description) VALUES
(1, 'Sci-Fi Lovers', 'Group for science fiction movie enthusiasts'),
(2, 'Classic Movies', 'Discussing timeless cinema');

INSERT INTO "groupMembers" (group_id, user_id, group_admin) VALUES
(1, 1, true),
(1, 2, false),
(2, 2, true),
(2, 3, false);

INSERT INTO "groupMessages" (group_id, user_id, message) VALUES
(1, 1, 'Welcome to Sci-Fi Lovers! What is your favorite sci-fi movie?'),
(1, 2, 'I love The Matrix!'),
(2, 2, 'Has anyone seen Casablanca?'),
(2, 3, 'Yes, it is a classic!');
