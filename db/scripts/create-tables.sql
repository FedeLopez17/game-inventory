CREATE TABLE pegi_ratings (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    rating VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(2048) NOT NULL,
    maturity_level INT NOT NULL
);

CREATE TABLE esrb_ratings (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    rating VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(2048) NOT NULL,
    maturity_level INT NOT NULL
);

CREATE TABLE videogames (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    release_date DATE NOT NULL,
    cover_image_url VARCHAR(2048) NOT NULL,
    banner_image_url VARCHAR(2048),
    description TEXT NOT NULL,
    website VARCHAR(2048),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pegi_rating_id INT REFERENCES pegi_ratings(id),
    esrb_rating_id INT REFERENCES esrb_ratings(id),
    metacritic_rating DECIMAL(5, 2) CHECK (metacritic_rating >= 0 AND metacritic_rating <= 100),
    opencritic_rating DECIMAL(5, 2) CHECK (opencritic_rating >= 0 AND opencritic_rating <= 100),
    ign_rating DECIMAL(5, 2) CHECK (ign_rating >= 0 AND ign_rating <= 10),
    goty BOOLEAN DEFAULT FALSE
);

CREATE TABLE images (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  videogame_id INTEGER REFERENCES videogames(id) NOT NULL,
  image_url TEXT NOT NULL
);

CREATE TABLE videos (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  videogame_id INTEGER REFERENCES videogames(id) NOT NULL,
  video_url TEXT NOT NULL
);

CREATE TABLE genres (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(2048) NOT NULL
);

CREATE TABLE videogames_genres (
    videogame_id INT REFERENCES videogames(id),
    genre_id INT REFERENCES genres(id),
    PRIMARY KEY (videogame_id, genre_id)
);

CREATE TABLE publishers (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_image_url VARCHAR(2048) NOT NULL
);

CREATE TABLE videogames_publishers (
    videogame_id INT REFERENCES videogames(id),
    publisher_id INT REFERENCES publishers(id),
    PRIMARY KEY (videogame_id, publisher_id)
);

CREATE TABLE studios (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_image_url VARCHAR(2048) NOT NULL
);

CREATE TABLE videogames_studios (
    videogame_id INT REFERENCES videogames(id),
    studio_id INT REFERENCES studios(id),
    PRIMARY KEY (videogame_id, studio_id)
);

CREATE TABLE platforms (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_image_url VARCHAR(2048) NOT NULL
);

CREATE TABLE videogames_platforms (
    videogame_id INT REFERENCES videogames(id),
    platform_id INT REFERENCES platforms(id),
    PRIMARY KEY (videogame_id, platform_id)
);
