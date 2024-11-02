const pool = require("../../config/pool.js");

module.exports = {
  getAllPegiRatings: async () => {
    const { rows } = await pool.query("SELECT * FROM pegi_ratings");
    return rows;
  },

  getAllEsrbRatings: async () => {
    const { rows } = await pool.query("SELECT * FROM esrb_ratings");
    return rows;
  },
};
