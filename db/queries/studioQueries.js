const pool = require("../../config/pool.js");

module.exports = {
  getAllStudios: async () => {
    const { rows } = await pool.query("SELECT * FROM studios");
    return rows;
  },
};
