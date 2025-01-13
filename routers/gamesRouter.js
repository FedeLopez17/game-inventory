const express = require("express");
const gamesController = require("../controllers/gamesController");
const upload = require("../config/multerConfig");

const gamesRouter = express.Router();

gamesRouter.get("/", gamesController.getGames);

gamesRouter.get("/add", gamesController.getAddGame);
gamesRouter.post(
  "/add",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "banner", maxCount: 1 },
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
  ]),
  gamesController.updateGame
);

module.exports = gamesRouter;
