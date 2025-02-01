const pool = require("../../config/pool.js");
const gameQueries = require("./gameQueries");

const getAllGenres = async () => {
  const { rows } = await pool.query("SELECT * FROM genres");
  return rows;
};

const getGenreById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM GENRES WHERE id = $1", [id]);
  return rows[0];
};

const getGenreByName = async (name) => {
  const { rows } = await pool.query(
    "SELECT * FROM genres WHERE name ILIKE $1",
    [name]
  );
  return rows[0];
};

const addGenre = async (name, description, image) => {
  const result = await pool.query(
    "INSERT INTO genres (name, description, icon_url) VALUES ($1, $2, $3) RETURNING *",
    [name, description, image]
  );

  return result.rows[0];
};

const deleteGenreById = async (id) => {
  console.log("DELETE GENRE: " + id);
  // NOMBREEE

  const genre = await getGenreById(id);

  console.log(genre);

  if (!genre) return;

  const games = await gameQueries.getGamesByGenre(genre.name);
  console.log(games.length);

  if (!games.length) return;

  games.forEach(
    async (game) => await gameQueries.deleteGameById(game.videogame_id)
  );

  await pool.query("DELETE FROM videogames_genres WHERE genre_id = $1", [id]);
  await pool.query("DELETE FROM genres WHERE id = $1", [id]);
};

const updateGenre = async (id, name, description, imageUrl) => {
  await pool.query(
    "UPDATE genres SET name = $1, description = $2, icon_url = $3 WHERE id = $4",
    [name, description, imageUrl, id]
  );
};

module.exports = {
  getAllGenres,
  getGenreById,
  getGenreByName,
  addGenre,
  deleteGenreById,
  updateGenre,
};
