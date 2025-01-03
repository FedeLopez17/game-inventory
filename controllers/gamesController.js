const ageRatingQueries = require("../db/queries/ageRatingQueries");
const gameQueries = require("../db/queries/gameQueries");
const genreQueries = require("../db/queries/genreQueries");
const platformQueries = require("../db/queries/platformQueries");
const studioQueries = require("../db/queries/studioQueries");
const publisherQueries = require("../db/queries/publisherQueries");
const { body, validationResult } = require("express-validator");
const { streamUpload, deleteImage } = require("../config/cloudinaryConfig");

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
    const games = await gameQueries.getAllGames();
    res.render("games/games", { games });
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
      } = req.body;

      const coverImageBuffer = req.files.cover[0].buffer;
      const bannerImageBuffer = req.files.banner
        ? req.files.banner[0].buffer
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
          goty
        );

        res.redirect("/games");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading image(s) or adding game");
      }
    },
  ],
};
