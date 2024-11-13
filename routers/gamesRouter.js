const express = require("express");
const gamesController = require("../controllers/gamesController");

const gamesRouter = express.Router();

gamesRouter.get("/", gamesController.getGames);

gamesRouter.get("/add", gamesController.getAddGame);
gamesRouter.post("/add", gamesController.addGame);

module.exports = gamesRouter;
