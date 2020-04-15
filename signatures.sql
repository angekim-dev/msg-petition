DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL CHECK (signature != ''),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- here we are adding the foreign key (user_id)
-- foreign key lets us identify which user from the users table signed the petition
-- and which signature is theirs (acts as an identifier btw the 2 tables!)