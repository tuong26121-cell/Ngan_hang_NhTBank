CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, position INTEGER UNIQUE NOT NULL, body TEXT NOT NULL CHECK(json_valid(body)));
PRAGMA user_version = 2;
