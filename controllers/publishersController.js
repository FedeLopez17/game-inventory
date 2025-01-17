const publisherQueries = require("../db/queries/publisherQueries");
const gameQueries = require("../db/queries/gameQueries");
const { streamUpload, deleteImage } = require("../config/cloudinaryConfig");
const { body, validationResult } = require("express-validator");

const PUBLISHERS_PER_PAGE = 4;

const validatePublisher = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("Name must be at most 255 characters.")
    .custom(async (value) => {
      const publisher = await publisherQueries.getPublisherByName(value);
      if (publisher) {
        throw new Error("Publisher already exists.");
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

const validatePublisherUpdate = [
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
  getPublishers: async (req, res) => {
    const { page = 1, limit = PUBLISHERS_PER_PAGE } = req.query;
    const pageNumber = parseInt(page, 10);
    const publishersPerPage = parseInt(limit, 10);
    const offset = (pageNumber - 1) * publishersPerPage;

    const publishers = await publisherQueries.getAllPublishers(
      publishersPerPage,
      offset
    );
    const totalPublishers = await publisherQueries.getPublishersCount();

    res.render("publishers/publishers", {
      publishers,
      page: {
        number: pageNumber,
        total: Math.ceil(totalPublishers / publishersPerPage),
      },
    });
  },

  searchPublishers: async (req, res) => {
    const { search } = req.body;

    const matchingPublishers = await publisherQueries.search(search);
    if (!matchingPublishers) {
      return res.status(404).send("No publishers found");
    }

    return res.status(200).send(matchingPublishers);
  },

  getPublisherById: async (req, res) => {
    const { id } = req.params;

    try {
      const publisher = await publisherQueries.getPublisherById(id);
      if (!publisher) {
        return res.status(404).send("Publisher not found");
      }

      const games = await gameQueries.getGamesByPublisher(id);

      res.render("publishers/publisher", { publisher, games });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching publisher");
    }
  },

  getAddPublisher: async (req, res) =>
    res.render("add-entity", {
      entity: "publisher",
      formAction: "/publishers/add",
    }),

  addPublisher: [
    validatePublisher,
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
            entity: "publisher",
            formAction: "/publishers/add",
          });
        }
      }

      const { name, description } = req.body;
      const fileBuffer = req.file.buffer;

      try {
        const uploadResult = await streamUpload(fileBuffer, "publishers");
        const imageUrl = uploadResult.secure_url;

        const publisher = await publisherQueries.addPublisher(
          name,
          description,
          imageUrl
        );

        if (response === "JSON") {
          res.status(201).json(publisher);
        } else {
          res.redirect("/publishers");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading image or adding publisher");
      }
    },
  ],

  deletePublisherById: async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).send("Wrong password");
    }

    try {
      const publisher = await publisherQueries.getPublisherById(id);
      if (!publisher) {
        return res.status(404).send("Publisher not found");
      }

      await publisherQueries.deletePublisherById(id);
      await deleteImage("publishers", publisher.logo_image_url);
      res.status(204).send(); // No Content - deletion successful
    } catch (err) {
      console.error(err);
      res.status(500).send("Error uploading image or adding publisher");
    }
  },

  getUpdatePublisher: async (req, res) => {
    const { id } = req.params;

    const publisher = await publisherQueries.getPublisherById(id);

    if (!publisher) {
      return res.status(404).send("Publisher not found");
    }

    res.render("update-entity", {
      formData: { ...publisher },
      id,
      entity: "publisher",
      fetchUrl: "/publishers/update",
      redirect: "/publishers",
    });
  },

  updatePublisher: [
    validatePublisherUpdate,
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

      const existingPublisher = await publisherQueries.getPublisherById(id);

      if (!existingPublisher) {
        return res.status(404).send("Publisher not found");
      }

      if (newFileUploaded) {
        const fileBuffer = req.file.buffer;
        const uploadResult = await streamUpload(fileBuffer, "publishers");
        const newImageUrl = uploadResult.secure_url;

        await deleteImage("publishers", existingPublisher.logo_image_url);

        await publisherQueries.updatePublisher(
          id,
          name,
          description,
          newImageUrl
        );
      } else {
        await publisherQueries.updatePublisher(
          id,
          name,
          description,
          existingPublisher.logo_image_url
        );
      }

      res.status(204).send();
    },
  ],
};
