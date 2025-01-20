const pool = require("../../config/pool.js");

module.exports = {
  search: async (search) => {
    const { rows } = await pool.query(
      "SELECT * FROM publishers WHERE name ILIKE $1 LIMIT 3",
      [`${search}%`]
    );
    return rows;
  },

  getAllPublishers: async (limit, offset) => {
    const { rows } = await pool.query(
      "SELECT * FROM publishers LIMIT $1 OFFSET $2",
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
    await pool.query("DELETE FROM publishers WHERE id = $1", [id]);
  },

  updatePublisher: async (id, name, description, imageUrl) => {
    await pool.query(
      "UPDATE publishers SET name = $1, description = $2, logo_image_url = $3 WHERE id = $4",
      [name, description, imageUrl, id]
    );
  },
};
