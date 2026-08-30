CREATE DATABASE IF NOT EXISTS knocknok;
USE knocknok;

CREATE TABLE IF NOT EXISTS keys_t (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seq VARCHAR(64) NOT NULL,
    sessions VARCHAR(255) DEFAULT '.',
    doors VARCHAR(255) DEFAULT '',
    paths VARCHAR(255) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS guests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session VARCHAR(32) DEFAULT NULL,
    pocket VARCHAR(32) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paths VARCHAR(255) DEFAULT '',
    doors VARCHAR(255) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sessions (
    s VARCHAR(32) PRIMARY KEY,
    t VARCHAR(1) NOT NULL,
    value VARCHAR(13) NOT NULL,
    extra VARCHAR(7) DEFAULT ''
);

INSERT INTO keys_t (id, seq, sessions, doors, paths) VALUES
    (1, 'abc', '.', '1.2.', '.lobby.'),
    (99, 'test', '.', '', '');

INSERT INTO rooms (id, paths, doors) VALUES
    (1, '.lobby.', '1.2.');
