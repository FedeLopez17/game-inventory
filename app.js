const express = require("express");
const genresRouter = require("./routers/genresRouter");
const gamesRouter = require("./routers/gamesRouter");
const generalRouter = require("./routers/generalRouter");
const studiosRouter = require("./routers/studiosRouter");
const publishersRouter = require("./routers/publishersRouter");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static("public"));

app.use("/genres", genresRouter);
app.use("/studios", studiosRouter);
app.use("/publishers", publishersRouter);
app.use("/all", generalRouter);
app.use("/games", gamesRouter);

app.get("/", (req, res) => res.redirect("/games"));

app.use((req, res) => res.status(404).render("404"));

app.listen(3000, () => console.log("App listening for requests on port 3000"));
