const studioQueries = require("../db/queries/studioQueries");
const gameQueries = require("../db/queries/gameQueries");
const { streamUpload, deleteImage } = require("../config/cloudinaryConfig");
const { body, validationResult } = require("express-validator");

const STUDIOS_PER_PAGE = 12;
const GAMES_PER_PAGE = 12;

const validateStudio = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("Name must be at most 255 characters.")
    .custom(async (value) => {
      const studio = await studioQueries.getStudioByName(value);
      if (studio) {
        throw new Error("Studio already exists.");
      }
      return true;
    }),

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

const validateStudioUpdate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("Name must be at most 255 characters."),

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
  getStudios: async (req, res) => {
    const { page = 1, limit = STUDIOS_PER_PAGE } = req.query;
    const pageNumber = parseInt(page, 10);
    const studiosPerPage = parseInt(limit, 10);
    const offset = (pageNumber - 1) * studiosPerPage;

    const studios = await studioQueries.getAllStudios(studiosPerPage, offset);
    const totalStudios = await studioQueries.getStudiosCount();

    res.render("studios/studios", {
      studios,
      page: {
        number: pageNumber,
        total: Math.ceil(totalStudios / studiosPerPage),
      },
    });
  },

  getStudiosBySearch: async (req, res) => {
    const { search, page = 1, limit = STUDIOS_PER_PAGE } = req.query;
    const pageNumber = parseInt(page, 10);
    const studiosPerPage = parseInt(limit, 10);
    const offset = (pageNumber - 1) * studiosPerPage;

    const studios = await studioQueries.search(search, studiosPerPage, offset);
    const totalStudios = await studioQueries.getSearchCount(search);

    res.render("search-result", {
      studios,
      query: req.query,
      page: {
        number: pageNumber,
        total: Math.ceil(totalStudios / studiosPerPage),
      },
    });
  },

  searchStudios: async (req, res) => {
    const { search } = req.body;

    const matchingStudios = await studioQueries.search(search);
    if (!matchingStudios) {
      return res.status(404).send("No studios found");
    }

    return res.status(200).send(matchingStudios);
  },

  getSearchTotal: async (req, res) => {
    const { search } = req.body;
    const total = await studioQueries.getSearchCount(search);
    return res.send({ total });
  },

  getStudioById: async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = GAMES_PER_PAGE } = req.query;
    const pageNumber = parseInt(page, 10);
    const gamesPerPage = parseInt(limit, 10);
    const offset = (pageNumber - 1) * gamesPerPage;

    try {
      const studio = await studioQueries.getStudioById(id);
      if (!studio) {
        return res.status(404).send("Studio not found");
      }

      const games = await gameQueries.getGamesByStudio(
        id,
        gamesPerPage,
        offset
      );
      const totalGames = await gameQueries.getTotalByStudio(id);

      res.render("studios/studio", {
        studio,
        games,
        query: req.query,
        page: {
          number: pageNumber,
          total: Math.ceil(totalGames / gamesPerPage),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching studio");
    }
  },

  getAddStudio: async (req, res) =>
    res.render("add-entity", { entity: "studio", formAction: "/studios/add" }),

  addStudio: [
    validateStudio,
    async (req, res) => {
      const { response } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (response === "JSON") {
          return res.status(400).json({ errors: errors.array() });
        } else {
          return res.status(400).render("add-entity", {
            errors: errors.array(),
            formData: req.body,
            entity: "studio",
            formAction: "/studios/add",
          });
        }
      }

      const { name, description } = req.body;
      const fileBuffer = req.file.buffer;

      try {
        const uploadResult = await streamUpload(fileBuffer, "studios");
        const imageUrl = uploadResult.secure_url;

        const studio = await studioQueries.addStudio(
          name,
          description,
          imageUrl
        );

        if (response === "JSON") {
          res.status(201).json(studio);
        } else {
          res.redirect("/studios");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading image or adding studio");
      }
    },
  ],

  deleteStudioById: async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).send("Wrong password");
    }

    try {
      const studio = await studioQueries.getStudioById(id);
      if (!studio) {
        return res.status(404).send("Studio not found");
      }

      await studioQueries.deleteStudioById(id);
      await deleteImage("studios", studio.logo_image_url);
      res.status(204).send(); // No Content - deletion successful
    } catch (err) {
      console.error(err);
      res.status(500).send("Error uploading image or adding studio");
    }
  },

  getUpdateStudio: async (req, res) => {
    const { id } = req.params;

    const studio = await studioQueries.getStudioById(id);

    if (!studio) {
      return res.status(404).send("Studio not found");
    }

    res.render("update-entity", {
      formData: { ...studio },
      id,
      entity: "studio",
      fetchUrl: "/studios/update",
      redirect: "/studios",
    });
  },

  updateStudio: [
    validateStudioUpdate,
    async (req, res) => {
      const { password } = req.body;

      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).send("Wrong password");
      }

      const { id } = req.params;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).send(errors);
      }

      const { name, description } = req.body;

      const newFileUploaded = req.file !== undefined;

      const existingStudio = await studioQueries.getStudioById(id);

      if (!existingStudio) {
        return res.status(404).send("Studio not found");
      }

      if (newFileUploaded) {
        const fileBuffer = req.file.buffer;
        const uploadResult = await streamUpload(fileBuffer, "studios");
        const newImageUrl = uploadResult.secure_url;

        await deleteImage("studios", existingStudio.logo_image_url);

        await studioQueries.updateStudio(id, name, description, newImageUrl);
      } else {
        await studioQueries.updateStudio(
          id,
          name,
          description,
          existingStudio.logo_image_url
        );
      }

      res.status(204).send();
    },
  ],
};
