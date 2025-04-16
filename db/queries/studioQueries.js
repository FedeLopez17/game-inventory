const pool = require("../../config/pool.js");
const gameQueries = require("./gameQueries");

module.exports = {
  search: async (search, studiosPerPage, offset) => {
    let query = "SELECT * FROM studios WHERE name ILIKE $1";
    const params = [`${search}%`];

    if (studiosPerPage != undefined && offset != undefined) {
      query += " LIMIT $2 OFFSET $3";
      params.push(studiosPerPage, offset);
    } else {
      query += " LIMIT 3";
    }

    const { rows } = await pool.query(query, params);
    return rows;
  },

  getAllStudios: async (sort, limit, offset) => {
    const sortBy =
      sort == "az" ? "LOWER(name) ASC" : sort == "za" ? "LOWER(name) DESC" : "";

    const { rows } = await pool.query(
      `SELECT * FROM studios 
      ${sortBy ? `ORDER BY ${sortBy}` : ""} 
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  },

  getStudiosCount: async () => {
    const { rows } = await pool.query("SELECT COUNT(*) AS total FROM studios");
    return parseInt(rows[0].total, 10);
  },

  getSearchCount: async (search) => {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS total FROM studios where name ILIKE $1`,
      [`${search}%`]
    );
    return parseInt(rows[0].total, 10);
  },

  getStudioById: async (id) => {
    const { rows } = await pool.query("SELECT * FROM studios WHERE id = $1", [
      id,
    ]);
    return rows[0];
  },

  getStudioByName: async (name) => {
    const { rows } = await pool.query(
      "SELECT * FROM studios WHERE name ILIKE $1",
      [name]
    );
    return rows[0];
  },

  addStudio: async (name, description, image) => {
    const result = await pool.query(
      "INSERT INTO studios (name, description, logo_image_url) VALUES ($1, $2, $3) RETURNING *",
      [name, description, image]
    );

    return result.rows[0];
  },

  deleteStudioById: async (id) => {
    const games = await gameQueries.getGamesByStudio(id);
    games.forEach(
      async (game) => await gameQueries.deleteGameById(game.videogame_id)
    );

    await pool.query("DELETE FROM videogames_studios WHERE studio_id = $1", [
      id,
    ]);

    await pool.query("DELETE FROM studios WHERE id = $1", [id]);
  },

  updateStudio: async (id, name, description, imageUrl) => {
    await pool.query(
      "UPDATE studios SET name = $1, description = $2, logo_image_url = $3 WHERE id = $4",
      [name, description, imageUrl, id]
    );
  },
};
