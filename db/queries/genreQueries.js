const pool = require("../../config/pool.js");

module.exports = {
  getAllGenres: async () => {
    const { rows } = await pool.query(`SELECT * FROM genres`);
    return rows;
  },

  getGenreByName: async (name) => {
    const { rows } = await pool.query(
      `SELECT * FROM genres WHERE name ILIKE $1`,
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
};
