const pool = require("../../config/pool.js");

module.exports = {
  getAllGenres: async () => {
    const { rows } = await pool.query("SELECT * FROM genres");
    return rows;
  },

  getGenreById: async (id) => {
    const { rows } = await pool.query("SELECT * FROM GENRES WHERE id = $1", [
      id,
    ]);
    return rows[0];
  },

  getGenreByName: async (name) => {
    const { rows } = await pool.query(
      "SELECT * FROM genres WHERE name ILIKE $1",
      [name]
    );
    return rows[0];
  },

  addGenre: async (name, description, image) => {
    await pool.query(
      "INSERT INTO genres (name, description, icon_url) VALUES ($1, $2, $3)",
      [name, description, image]
    );
  },

  deleteGenreById: async (id) => {
    await pool.query("DELETE FROM genres WHERE id = $1", [id]);
  },
};
