const pool = require("../../config/pool.js");

module.exports = {
  getAllPublishers: async () => {
    const { rows } = await pool.query("SELECT * FROM publishers");
    return rows;
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
