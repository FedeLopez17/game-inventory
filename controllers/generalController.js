const gameQueries = require("../db/queries/gameQueries");
const studioQueries = require("../db/queries/studioQueries");
const publisherQueries = require("../db/queries/publisherQueries");

CARDS_PER_PAGE = 4;

module.exports = {
  searchAll: async (req, res) => {
    const { search, domain, page = 1, limit = CARDS_PER_PAGE } = req.query;
    // entityId = parseInt(entityId, 10);
    const pageNumber = parseInt(page, 10);
    const cardsPerPage = parseInt(limit, 10);
    const offset = (pageNumber - 1) * cardsPerPage;

    const games = await gameQueries.search(search, cardsPerPage, offset);
    const totalGames = await gameQueries.getSearchCount(search);

    const publishers = await publisherQueries.search(
      search,
      cardsPerPage,
      offset
    );
    const totalPublishers = await publisherQueries.getSearchCount(search);

    const studios = await studioQueries.search(search, cardsPerPage, offset);
    const totalStudios = await studioQueries.getSearchCount(search);

    const highestTotal = Math.max(totalPublishers, totalGames, totalStudios);

    res.render("search-result", {
      games,
      studios,
      publishers,
      query: req.query,
      page: {
        number: pageNumber,
        total: Math.ceil(highestTotal / cardsPerPage),
      },
    });
  },
};
