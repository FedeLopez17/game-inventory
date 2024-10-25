const express = require("express");
const genresRouter = express.Router();
const upload = require("../config/multerConfig");
const genresController = require("../controllers/genresController");

genresRouter.get("/", genresController.getGenres);
genresRouter.get("/:id", genresController.getGenreById);

genresRouter.get("/add", genresController.getAddGenre);
genresRouter.post(
  "/add",
  upload.single("genre-image"),
  genresController.addGenre
);

module.exports = genresRouter;
