const genreQueries = require("../db/queries/genreQueries");
const streamUpload = require("../config/cloudinaryConfig");
const { body, validationResult } = require("express-validator");

const validateGenre = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("Name must be at most 255 characters.")
    .custom(async (value) => {
      const genre = await genreQueries.getGenreByName(value);
      if (genre) {
        throw new Error("Genre name already in use.");
      }
      return true;
    }),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty.")
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters."),

  body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Image file is required.");
    }
    const fileSize = req.file.size; // Size in bytes
    if (fileSize > 2 * 1024 * 1024) {
      // 2MB
      throw new Error("Image file must be less than 2MB.");
    }
    return true;
  }),
];

module.exports = {
  getGenres: async (req, res) => {
    const genres = await genreQueries.getAllGenres();
    res.render("genres", { genres });
  },

  //TODO: this should return related games
  getGenreById: async (req, res) => {
    const { id } = req.params;

    try {
      const genre = await genreQueries.getGenreById(id);
      if (!genre) {
        return res.status(404).send("Genre not found");
      }
      res.render("genre", { genre });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching genre");
    }
  },

  getAddGenre: async (req, res) => res.render("add-genre"),

  addGenre: [
    validateGenre,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("add-genre", {
          errors: errors.array(),
          formData: req.body,
        });
      }

      const { name, description } = req.body;
      const fileBuffer = req.file.buffer;

      try {
        const uploadResult = await streamUpload(fileBuffer, "genres");
        const imageUrl = uploadResult.secure_url;

        await genreQueries.addGenre(name, description, imageUrl);

        res.redirect("/genres");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading image or adding genre");
      }
    },
  ],
};
