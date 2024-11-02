const pool = require("../../config/pool.js");

module.exports = {
  getAllPlatforms: async () => {
    const { rows } = await pool.query("SELECT * FROM platforms");
    return rows;
  },
};
