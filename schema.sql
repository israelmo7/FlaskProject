CREATE DATABASE IF NOT EXISTS knocknok;
USE knocknok;

CREATE TABLE IF NOT EXISTS keys_t (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seq VARCHAR(64) NOT NULL,
    sessions VARCHAR(255) DEFAULT '.',
    doors VARCHAR(255) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS guests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session VARCHAR(32) DEFAULT NULL,
    pocket VARCHAR(32) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paths VARCHAR(255) DEFAULT '',
    doors VARCHAR(255) DEFAULT '',
    chat VARCHAR(255) DEFAULT '.'
);

CREATE TABLE IF NOT EXISTS sessions (
    s VARCHAR(32) PRIMARY KEY,
    t VARCHAR(1) NOT NULL,
    value VARCHAR(13) NOT NULL,
    extra VARCHAR(7) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO keys_t (id, seq, sessions, doors) VALUES
    (1, 'abc', '.', '1.2.'),
    (99, 'test', '.', '');

INSERT IGNORE INTO rooms (id, paths, doors, chat) VALUES
    (1, '.lobby.', '1.2.', '.');
