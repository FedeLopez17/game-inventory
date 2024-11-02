const pool = require("../../config/pool.js");

module.exports = {
  getAllPublishers: async () => {
    const { rows } = await pool.query("SELECT * FROM publishers");
    return rows;
  },
};
