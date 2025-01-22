const express = require("express");
const generalController = require("../controllers/generalController");

const generalRouter = express.Router();

generalRouter.get("/search", generalController.searchAll);

module.exports = generalRouter;
