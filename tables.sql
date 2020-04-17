DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL CHECK (signature != ''),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- here we are adding the foreign key (user_id)
-- foreign key lets us identify which user from the users table signed the petition
-- and which signature is theirs (acts as an identifier btw the 2 tables!)

CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL CHECK (first != ''),
      last VARCHAR(255) NOT NULL CHECK (last != ''),
      email VARCHAR(255) NOT NULL UNIQUE CHECK (email != ''),
      password VARCHAR(255) NOT NULL CHECK (password != ''),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

  CREATE TABLE user_profiles(
  id SERIAL PRIMARY KEY,
  age INT,
  city VARCHAR(100),
  url VARCHAR(300),
  user_id INT REFERENCES users(id) NOT NULL UNIQUE --unique means they can only have 1 row;
  );