const express = require("express");
const genresRouter = require("./routers/genresRouter");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static("public"));

app.use("/genres", genresRouter);

app.use((req, res) => res.status(404).render("404"));

app.listen(3000, () => console.log("App listening for requests on port 3000"));
