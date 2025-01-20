const express = require("express");
const publishersRouter = express.Router();
const upload = require("../config/multerConfig");
const publishersController = require("../controllers/publishersController");

publishersRouter.put(
  "/update/:id",
  upload.single("publisher-image"),
  publishersController.updatePublisher
);
publishersRouter.get("/update/:id", publishersController.getUpdatePublisher);

publishersRouter.post("/search", publishersController.searchPublishers);
publishersRouter.post("/search/total", publishersController.getSearchTotal);

publishersRouter.delete(
  "/delete/:id",
  publishersController.deletePublisherById
);

publishersRouter.get("/add", publishersController.getAddPublisher);
publishersRouter.post(
  "/add",
  upload.single("publisher-image"),
  publishersController.addPublisher
);

publishersRouter.get("/", publishersController.getPublishers);
publishersRouter.get("/:id", publishersController.getPublisherById);

module.exports = publishersRouter;
