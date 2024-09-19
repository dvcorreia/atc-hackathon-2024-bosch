CREATE TABLE users (
    id integer,

    PRIMARY KEY (id),
    UNIQUE (username, email)
);
