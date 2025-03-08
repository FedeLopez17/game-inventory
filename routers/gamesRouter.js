const express = require("express");
const gamesController = require("../controllers/gamesController");
const upload = require("../config/multerConfig");

const gamesRouter = express.Router();

gamesRouter.get("/", gamesController.getGames);
gamesRouter.get("/genre/:genre", gamesController.getGamesByGenre);

gamesRouter.post("/search", gamesController.searchGames);
gamesRouter.get("/search", gamesController.getGamesBySearch);
gamesRouter.post("/search/total", gamesController.getSearchTotal);

gamesRouter.get("/add", gamesController.getAddGame);
gamesRouter.post(
  "/add",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "gallery-images"}, // max count is validated in the controller
  ]),
  gamesController.addGame
);

gamesRouter.get("/:id", gamesController.getGameById);

gamesRouter.delete("/delete/:id", gamesController.deleteGameById);

gamesRouter.get("/update/:id", gamesController.getUpdateGame);
gamesRouter.put(
  "/update/:id",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "gallery-images"}, // max count is validated in the controller
  ]),
  gamesController.updateGame
);

module.exports = gamesRouter;
