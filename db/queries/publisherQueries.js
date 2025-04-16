const pool = require("../../config/pool.js");
const gameQueries = require("./gameQueries");

module.exports = {
  search: async (search, publishersPerPage, offset) => {
    let query = "SELECT * FROM publishers WHERE name ILIKE $1";
    const params = [`${search}%`];

    if (publishersPerPage != undefined && offset != undefined) {
      query += " LIMIT $2 OFFSET $3";
      params.push(publishersPerPage, offset);
    } else {
      query += " LIMIT 3";
    }

    const { rows } = await pool.query(query, params);
    return rows;
  },

  getAllPublishers: async (sort, limit, offset) => {
    const sortBy =
      sort == "az" ? "LOWER(name) ASC" : sort == "za" ? "LOWER(name) DESC" : "";

    const { rows } = await pool.query(
      `SELECT * FROM publishers 
      ${sortBy ? `ORDER BY ${sortBy}` : ""} 
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    return rows;
  },

  getPublishersCount: async () => {
    const { rows } = await pool.query(
      "SELECT COUNT(*) AS total FROM publishers"
    );
    return parseInt(rows[0].total, 10);
  },

  getSearchCount: async (search) => {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS total FROM publishers where name ILIKE $1`,
      [`${search}%`]
    );
    return parseInt(rows[0].total, 10);
  },

  getPublisherById: async (id) => {
    const { rows } = await pool.query(
      "SELECT * FROM publishers WHERE id = $1",
      [id]
    );
    return rows[0];
  },

  getPublisherByName: async (name) => {
    const { rows } = await pool.query(
      "SELECT * FROM publishers WHERE name ILIKE $1",
      [name]
    );
    return rows[0];
  },

  addPublisher: async (name, description, image) => {
    const result = await pool.query(
      "INSERT INTO publishers (name, description, logo_image_url) VALUES ($1, $2, $3) RETURNING *",
      [name, description, image]
    );

    return result.rows[0];
  },

  deletePublisherById: async (id) => {
    const games = await gameQueries.getGamesByPublisher(id);
    games.forEach(
      async (game) => await gameQueries.deleteGameById(game.videogame_id)
    );

    await pool.query(
      "DELETE FROM videogames_publishers WHERE publisher_id = $1",
      [id]
    );
    await pool.query("DELETE FROM publishers WHERE id = $1", [id]);
  },

  updatePublisher: async (id, name, description, imageUrl) => {
    await pool.query(
      "UPDATE publishers SET name = $1, description = $2, logo_image_url = $3 WHERE id = $4",
      [name, description, imageUrl, id]
    );
  },
};
