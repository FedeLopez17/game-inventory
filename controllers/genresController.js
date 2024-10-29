const genreQueries = require("../db/queries/genreQueries");
const { streamUpload, deleteImage } = require("../config/cloudinaryConfig");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

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

const validateGenreUpdate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("Name must be at most 255 characters."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty.")
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters."),

  body("file").custom((value, { req }) => {
    if (req.file) {
      const fileSize = req.file.size; // Size in bytes
      if (fileSize > 2 * 1024 * 1024) {
        // 2MB
        throw new Error("Image file must be less than 2MB.");
      }
    }
    return true;
  }),
];

module.exports = {
  getGenres: async (req, res) => {
    const genres = await genreQueries.getAllGenres();
    res.render("genres/genres", { genres });
  },

  //TODO: this should return related games
  getGenreById: async (req, res) => {
    const { id } = req.params;

    try {
      const genre = await genreQueries.getGenreById(id);
      if (!genre) {
        return res.status(404).send("Genre not found");
      }
      res.render("genres/genre", { genre });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching genre");
    }
  },

  getAddGenre: async (req, res) => res.render("genres/add-genre"),

  addGenre: [
    validateGenre,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("genres/add-genre", {
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

  deleteGenreById: async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).send("Wrong password");
    }

    try {
      const genre = await genreQueries.getGenreById(id);
      if (!genre) {
        return res.status(404).send("Genre not found");
      }

      await genreQueries.deleteGenreById(id);
      await deleteImage("genres", genre.icon_url);
      res.status(204).send(); // No Content - deletion successful
    } catch (err) {
      console.error(err);
      res.status(500).send("Error uploading image or adding genre");
    }
  },

  getUpdateGenre: async (req, res) => {
    const { id } = req.params;

    const genre = await genreQueries.getGenreById(id);

    if (!genre) {
      return res.status(404).send("Genre not found");
    }

    res.render("genres/update-genre", { formData: { ...genre }, id });
  },

  updateGenre: [
    validateGenreUpdate,
    async (req, res) => {
      const { password } = req.body;

      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).send("Wrong password");
      }

      const { id } = req.params;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // This won't work as I'm fetching with js.
        // return res.status(400).render("genres/update-genre", {
        //   errors: errors.array(),
        //   formData: req.body,
        //   id,
        // });

        return res.status(400).send(errors);
      }

      const { name, description } = req.body;
      const newFileUploaded = req.file !== undefined;

      const existingGenre = await genreQueries.getGenreById(id);

      if (!existingGenre) {
        return res.status(404).send("Genre not found");
      }

      if (newFileUploaded) {
        const fileBuffer = req.file.buffer;
        const uploadResult = await streamUpload(fileBuffer, "genres");
        const newImageUrl = uploadResult.secure_url;

        await deleteImage("genres", existingGenre.icon_url);

        await genreQueries.updateGenre(id, name, description, newImageUrl);
      } else {
        await genreQueries.updateGenre(
          id,
          name,
          description,
          existingGenre.icon_url
        );
      }

      res.status(204).send();
    },
  ],
};
