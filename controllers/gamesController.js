const ageRatingQueries = require("../db/queries/ageRatingQueries");
const gameQueries = require("../db/queries/gameQueries");
const genreQueries = require("../db/queries/genreQueries");
const platformQueries = require("../db/queries/platformQueries");
const studioQueries = require("../db/queries/studioQueries");
const publisherQueries = require("../db/queries/publisherQueries");
const { body, validationResult } = require("express-validator");
const { streamUpload, deleteImage } = require("../config/cloudinaryConfig");

const GAMES_PER_PAGE = 12;

const validateGame = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("Title must be at most 255 characters.")
    .custom(async (value) => {
      const game = await gameQueries.getGameByName(value);
      if (game) {
        throw new Error("Game name already in use.");
      }
      return true;
    }),

  body("release").notEmpty().withMessage("Release date cannot be empty."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty.")
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters."),

  body("platforms").notEmpty().withMessage("Platform/s cannot be empty."),

  body("genre").notEmpty().withMessage("Genre/s cannot be empty."),

  body("studio").notEmpty().withMessage("Studio/s cannot be empty."),

  body("publisher").notEmpty().withMessage("Publisher/s cannot be empty."),

  body("gallery").custom((_, { req }) => {
    if (req.files["gallery-images"] && req.files["gallery-images"].length > 8) {
      throw new Error("Up to 8 images allowed in gallery");
    }
    return true;
  }),

  body("videos").custom((_, { req }) => {
    const videos = JSON.parse(req.body.videos);
    if (!videos || videos.length <= 3) return true;

    throw new Error("Up to 3 videos allowed in gallery");
  }),

  body("cover").custom((_, { req }) => {
    if (!req.files.cover) {
      throw new Error("Cover image is required.");
    }
    const fileSize = req.files.cover[0].size; // Size in bytes
    console.log("COVER FILE SIZE: " + fileSize);

    if (fileSize > 2 * 1024 * 1024) {
      // 2MB
      throw new Error("Image file must be less than 2MB.");
    }
    return true;
  }),

  body("banner").custom((_, { req }) => {
    if (!req.files.banner) {
      return true;
    }

    const fileSize = req.files.cover[0].size; // Size in bytes

    if (fileSize > 2 * 1024 * 1024) {
      // 2MB
      throw new Error("Image file must be less than 2MB.");
    }
    return true;
  }),

  body("ign")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 10 })
    .withMessage("IGN Score must be between 0 and 10.")
    .toFloat(),

  body("opencritic")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 })
    .withMessage("OpenCritic Score must be between 0 and 100.")
    .toInt(),

  body("metacritic")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 })
    .withMessage("Metacritic Score must be between 0 and 100.")
    .toInt(),
];

const validateGameUpdate = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("Title must be at most 255 characters.")
    .custom(async (value, { req }) => {
      const game = await gameQueries.getGameByName(value);

      // Allow same name only if the game ID matches the current game's ID
      if (game && game.videogame_id != req.params.id) {
        throw new Error("Game name already in use.");
      }
      return true;
    }),

  body("gallery").custom((_, { req }) => {
    if (req.files["gallery-images"] && req.files["gallery-images"].length > 8) {
      throw new Error("Up to 8 images allowed in gallery");
    }
    return true;
  }),

  body("videos").custom((_, { req }) => {
    const videos = JSON.parse(req.body.videos);
    if (!videos || videos.length <= 3) return true;

    throw new Error("Up to 3 videos allowed in gallery");
  }),

  body("cover").custom((_, { req }) => {
    if (!req.files.cover) {
      return true;
    }

    const fileSize = req.files.cover[0].size; // Size in bytes

    if (fileSize > 2 * 1024 * 1024) {
      // 2MB
      throw new Error("Image file must be less than 2MB.");
    }
    return true;
  }),

  body("banner").custom((_, { req }) => {
    if (!req.files.banner) {
      return true;
    }

    const fileSize = req.files.banner[0].size; // Size in bytes

    if (fileSize > 2 * 1024 * 1024) {
      // 2MB
      throw new Error("Image file must be less than 2MB.");
    }
    return true;
  }),

  body("release").notEmpty().withMessage("Release date cannot be empty."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty.")
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters."),

  body("platforms").notEmpty().withMessage("Platform/s cannot be empty."),

  body("genre").notEmpty().withMessage("Genre/s cannot be empty."),

  body("studio").notEmpty().withMessage("Studio/s cannot be empty."),

  body("publisher").notEmpty().withMessage("Publisher/s cannot be empty."),

  body("ign")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 10 })
    .withMessage("IGN Score must be between 0 and 10.")
    .toFloat(),

  body("opencritic")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 })
    .withMessage("OpenCritic Score must be between 0 and 100.")
    .toInt(),

  body("metacritic")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 })
    .withMessage("Metacritic Score must be between 0 and 100.")
    .toInt(),
];

module.exports = {
  getGames: async (req, res) => {
    const { page = 1, limit = GAMES_PER_PAGE } = req.query;
    const pageNumber = parseInt(page, 10);
    const gamesPerPage = parseInt(limit, 10);
    const offset = (pageNumber - 1) * gamesPerPage;

    if (!req.query.genre) req.query.genre = "all";
    if (!req.query.platform) req.query.platform = "all";

    const pageGames = await gameQueries.getAllGames(
      req.query,
      gamesPerPage,
      offset
    );
    const totalGames = await gameQueries.getGamesCount(req.query);

    const genres = await genreQueries.getAllGenres();
    const platforms = await platformQueries.getAllPlatforms();

    res.render("games/games", {
      games: pageGames,
      genres,
      currentGenre: req.query.genre,
      platforms,
      currentPlatform: req.query.platform,
      sort: req.query.sort,
      query: req.query,
      page: {
        number: pageNumber,
        total: Math.ceil(totalGames / gamesPerPage),
      },
    });
  },

  getGamesBySearch: async (req, res) => {
    const {
      search,
      domainToSearchIn,
      page = 1,
      limit = GAMES_PER_PAGE,
    } = req.query;

    let entityId;
    if (req.query.entityId != undefined) {
      entityId = parseInt(req.query.entityId, 10);
    }

    const pageNumber = parseInt(page, 10);
    const gamesPerPage = parseInt(limit, 10);
    const offset = (pageNumber - 1) * gamesPerPage;

    if (domainToSearchIn && entityId) {
      const searchByEntity =
        domainToSearchIn == "studios"
          ? gameQueries.searchByStudio
          : gameQueries.searchByPublisher;
      const games = await searchByEntity(
        search,
        entityId,
        gamesPerPage,
        offset
      );

      const searchTotal =
        domainToSearchIn == "studios"
          ? gameQueries.searchTotalByStudio
          : gameQueries.searchTotalByPublisher;

      const totalGames = await searchTotal(search, entityId);

      const searchEntity =
        domainToSearchIn == "studios"
          ? studioQueries.getStudioById
          : publisherQueries.getPublisherById;
      const entity = await searchEntity(entityId);

      const page =
        domainToSearchIn == "studios"
          ? "studios/studio"
          : "publishers/publisher";

      res.render(page, {
        games,
        [domainToSearchIn == "studios" ? "studio" : "publisher"]: entity,
        query: req.query,
        page: {
          number: pageNumber,
          total: Math.ceil(totalGames / gamesPerPage),
        },
      });
    } else {
      const games = await gameQueries.search(search, gamesPerPage, offset);
      const totalGames = await gameQueries.getSearchCount(search);

      res.render("search-result", {
        games,
        query: req.query,
        page: {
          number: pageNumber,
          total: Math.ceil(totalGames / gamesPerPage),
        },
      });
    }
  },

  searchGames: async (req, res) => {
    const { search, domain, entityId } = req.body;

    let matchingGames;
    const searchByEntity =
      domain == "studios"
        ? gameQueries.searchByStudio
        : gameQueries.searchByPublisher;

    if (domain && entityId) {
      matchingGames = await searchByEntity(search, entityId);
    } else {
      matchingGames = await gameQueries.search(search);
    }

    if (!matchingGames) {
      return res.status(404).send("No games found");
    }

    return res.status(200).send(matchingGames);
  },

  getSearchTotal: async (req, res) => {
    const { search, domain, entityId } = req.body;
    let total;
    const searchTotalByEntity =
      domain == "studios"
        ? gameQueries.searchTotalByStudio
        : gameQueries.searchTotalByPublisher;

    if (domain && entityId) {
      total = await searchTotalByEntity(search, entityId);
    } else {
      total = await gameQueries.getSearchCount(search);
    }

    return res.send({ total });
  },

  getGameById: async (req, res) => {
    const { id } = req.params;

    try {
      const game = await gameQueries.getGameById(id);
      if (!game) {
        return res.status(404).send("Game not found");
      }
      res.render("games/game", { game });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching game");
    }
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

  addGame: [
    validateGame,
    async (req, res) => {
      const errors = validationResult(req);
      console.log("BODY");
      console.log(req.body);
      console.log("FILES");
      console.log(req.files);
      if (!errors.isEmpty()) {
        console.log("ERRORS");
        console.log(errors);

        const pegiRatings = await ageRatingQueries.getAllPegiRatings();
        const esrbRatings = await ageRatingQueries.getAllEsrbRatings();
        const genres = await genreQueries.getAllGenres();
        const platforms = await platformQueries.getAllPlatforms();
        const studios = await studioQueries.getAllStudios();
        const publishers = await publisherQueries.getAllPublishers();

        return res.status(400).render("games/add-game", {
          errors: errors.array(),
          formData: req.body,
          pegiRatings,
          esrbRatings,
          genres,
          platforms,
          studios,
          publishers,
        });
      }

      const {
        title,
        release,
        description,
        website,
        platforms,
        pegi,
        esrb,
        metacritic,
        opencritic,
        ign,
        genre,
        studio,
        publisher,
        goty,
        videos,
      } = req.body;

      console.log("VALUES: ");
      console.log(
        JSON.stringify({
          title,
          release,
          description,
          website,
          goty,
          platforms,
          pegi,
          esrb,
          ign,
          opencritic,
          metacritic,
          genre,
          studio,
          publisher,
          videos,
        })
      );

      const coverImageBuffer = req.files.cover[0].buffer;
      const bannerImageBuffer = req.files.banner
        ? req.files.banner[0].buffer
        : null;
      const galleryImages = req.files["gallery-images"]
        ? req.files["gallery-images"].map((image) => image.buffer)
        : null;

      try {
        const coverUploadResult = await streamUpload(
          coverImageBuffer,
          "covers"
        );
        const coverUrl = coverUploadResult.secure_url;

        let bannerUrl = null;
        if (bannerImageBuffer) {
          const bannerUploadResult = await streamUpload(
            bannerImageBuffer,
            "banners"
          );
          bannerUrl = bannerUploadResult.secure_url;
        }

        let galleryImageUrls = [];
        if (galleryImages) {
          galleryImageUrls = await Promise.all(
            galleryImages.map(async (imageBuffer) => {
              const imageUploadResult = await streamUpload(
                imageBuffer,
                "gallery"
              );
              return imageUploadResult.secure_url;
            })
          );
        }

        const sanitizeEmptyToNull = (number) => (number === "" ? null : number);

        const ignRating = sanitizeEmptyToNull(ign);
        const metacriticRating = sanitizeEmptyToNull(metacritic);
        const pegiRating = sanitizeEmptyToNull(pegi);
        const esrbRating = sanitizeEmptyToNull(esrb);
        const opencriticRating = sanitizeEmptyToNull(opencritic);

        await gameQueries.addGame(
          title,
          coverUrl,
          bannerUrl,
          galleryImageUrls,
          release,
          description,
          website,
          platforms,
          pegiRating,
          esrbRating,
          metacriticRating,
          opencriticRating,
          ignRating,
          genre,
          studio,
          publisher,
          goty,
          videos
        );

        res.redirect("/games");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading image(s) or adding game");
      }
    },
  ],

  deleteGameById: async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).send("Wrong password");
    }

    const gameToDelete = await gameQueries.getGameById(id);
    if (!gameToDelete) {
      return res.status(404).send("Game not found");
    }

    await deleteImage("covers", gameToDelete.cover_image_url);
    if (gameToDelete.banner_image_url) {
      await deleteImage("banners", gameToDelete.banner_image_url);
    }

    const deletionSuccessful = await gameQueries.deleteGameById(id);
    deletionSuccessful
      ? res.status(204).send("Game deleted successfully!")
      : res.status(500).send("Game couldn't be deleted!");
  },

  getUpdateGame: async (req, res) => {
    const { id } = req.params;

    const game = await gameQueries.getGameById(id);

    if (!game) {
      return res.status(404).send("Game not found");
    }

    const pegiRatings = await ageRatingQueries.getAllPegiRatings();
    const esrbRatings = await ageRatingQueries.getAllEsrbRatings();
    const genres = await genreQueries.getAllGenres();
    const platforms = await platformQueries.getAllPlatforms();
    const studios = await studioQueries.getAllStudios();
    const publishers = await publisherQueries.getAllPublishers();

    res.render("games/update-game", {
      formData: {
        ...game,
        release_date: game.release_date.toISOString().split("T")[0],
      },
      pegiRatings,
      esrbRatings,
      genres,
      platforms,
      studios,
      publishers,
    });
  },

  updateGame: [
    validateGameUpdate,
    async (req, res) => {
      const { password } = req.body;

      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).send("Wrong password");
      }

      const { id } = req.params;
      const game = await gameQueries.getGameById(id);
      if (!game) {
        return res.status(404).send("Game not found");
      }

      const {
        title,
        cover,
        banner,
        imagesToDelete,
        deleteBanner,
        release,
        description,
        website,
        goty,
        pegi,
        esrb,
        ign,
        opencritic,
        metacritic,
        videos,
      } = req.body;

      const platforms = req.body.platforms.split(",");
      const genre = req.body.genre.split(",");
      const studio = req.body.studio.split(",");
      const publisher = req.body.publisher.split(",");

      console.log("VALUES: ");
      console.log(
        JSON.stringify({
          title,
          cover,
          banner,
          imagesToDelete,
          release,
          description,
          website,
          goty,
          platforms,
          pegi,
          esrb,
          ign,
          opencritic,
          metacritic,
          genre,
          studio,
          publisher,
          deleteBanner,
          videos,
        })
      );

      console.log(typeof genre);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        console.log("ERRORS");
        console.log(errors);

        return res.status(400).json({
          errors: errors.array(),
        });
      }

      console.log("FILES");
      console.log(req.files);

      const coverImageBuffer = req.files.cover
        ? req.files.cover[0].buffer
        : null;
      const bannerImageBuffer = req.files.banner
        ? req.files.banner[0].buffer
        : null;
      const galleryImages = req.files["gallery-images"]
        ? req.files["gallery-images"].map((image) => image.buffer)
        : null;

      let coverUrl,
        bannerUrl = null;

      try {
        if (coverImageBuffer) {
          const coverUploadResult = await streamUpload(
            coverImageBuffer,
            "covers"
          );
          coverUrl = coverUploadResult.secure_url;
          await deleteImage("covers", game.cover_image_url);
        }

        if (bannerImageBuffer) {
          const bannerUploadResult = await streamUpload(
            bannerImageBuffer,
            "banners"
          );
          bannerUrl = bannerUploadResult.secure_url;
        }

        let galleryImageUrls = [];
        if (galleryImages) {
          galleryImageUrls = await Promise.all(
            galleryImages.map(async (imageBuffer) => {
              const imageUploadResult = await streamUpload(
                imageBuffer,
                "gallery"
              );
              return imageUploadResult.secure_url;
            })
          );
        }

        if (game.banner_image_url && (bannerImageBuffer || deleteBanner)) {
          await deleteImage("banners", game.banner_image_url);
        }

        if (imagesToDelete) {
          for (const imageUrl of JSON.parse(imagesToDelete)) {
            await deleteImage("gallery", imageUrl);
          }
        }

        const sanitizeEmptyToNull = (number) => (number === "" ? null : number);

        const ignRating = sanitizeEmptyToNull(ign);
        const metacriticRating = sanitizeEmptyToNull(metacritic);
        const pegiRating = sanitizeEmptyToNull(pegi);
        const esrbRating = sanitizeEmptyToNull(esrb);
        const opencriticRating = sanitizeEmptyToNull(opencritic);

        await gameQueries.updateGame(
          id,
          title,
          coverUrl || game.cover_image_url,
          deleteBanner == "true" ? null : bannerUrl || game.banner_image_url,
          galleryImageUrls,
          imagesToDelete,
          release,
          description,
          website,
          platforms,
          pegiRating,
          esrbRating,
          metacriticRating,
          opencriticRating,
          ignRating,
          genre,
          studio,
          publisher,
          goty,
          videos
        );

        res.status(200).send("Game updated successfully");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading image(s) or adding game");
      }
    },
  ],
};
