const express = require("express");
const studiosRouter = express.Router();
const upload = require("../config/multerConfig");
const studiosController = require("../controllers/studiosController");

studiosRouter.put(
  "/update/:id",
  upload.single("studio-image"),
  studiosController.updateStudio
);
studiosRouter.get("/update/:id", studiosController.getUpdateStudio);

studiosRouter.post("/search", studiosController.searchStudios);
studiosRouter.post("/search/total", studiosController.getSearchTotal);

studiosRouter.delete("/delete/:id", studiosController.deleteStudioById);

studiosRouter.get("/add", studiosController.getAddStudio);
studiosRouter.post(
  "/add",
  upload.single("studio-image"),
  studiosController.addStudio
);

studiosRouter.get("/", studiosController.getStudios);
studiosRouter.get("/:id", studiosController.getStudioById);

module.exports = studiosRouter;
