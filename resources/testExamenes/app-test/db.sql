CREATE DATABASE IF NOT EXISTS test;
USE test;

CREATE TABLE questions (
    idQuestion INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    correctAnswerId INT NOT NULL,
    explication TEXT
);

CREATE TABLE answers (
    idAnswer INT PRIMARY KEY AUTO_INCREMENT,
    answer TEXT NOT NULL,
    idQuestion INT,
    FOREIGN KEY (idQuestion) REFERENCES questions(idQuestion)
);



