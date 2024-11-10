const ageRatingQueries = require("../db/queries/ageRatingQueries");
const gameQueries = require("../db/queries/gameQueries");
const genreQueries = require("../db/queries/genreQueries");
const platformQueries = require("../db/queries/platformQueries");
const studioQueries = require("../db/queries/studioQueries");
const publisherQueries = require("../db/queries/publisherQueries");

module.exports = {
  getGames: async (req, res) => {
    // const games = await gameQueries.getAllGames();

    // Empty for now, until we implement game queries
    res.render("games/games", { games: [] });
  },

  getAddGame: async (req, res) => {
    const pegiRatings = await ageRatingQueries.getAllPegiRatings();
    const esrbRatings = await ageRatingQueries.getAllEsrbRatings();
    const genres = await genreQueries.getAllGenres();
    const platforms = await platformQueries.getAllPlatforms();
    const studios = await studioQueries.getAllStudios();
    const publishers = await publisherQueries.getAllPublishers();

    res.render("games/add-game", {
      pegiRatings,
      esrbRatings,
      genres,
      platforms,
      studios,
      publishers,
    });
  },
};
