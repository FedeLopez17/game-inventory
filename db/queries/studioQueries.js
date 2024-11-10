const pool = require("../../config/pool.js");

module.exports = {
  getAllStudios: async () => {
    const { rows } = await pool.query("SELECT * FROM studios");
    return rows;
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
    await pool.query("DELETE FROM studios WHERE id = $1", [id]);
  },

  updateStudio: async (id, name, description, imageUrl) => {
    await pool.query(
      "UPDATE studios SET name = $1, description = $2, logo_image_url = $3 WHERE id = $4",
      [name, description, imageUrl, id]
    );
  },
};
