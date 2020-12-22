const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const feedRoutes = require("./routes/feed");

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message });
});

mongoose
  .connect("mongodb://sevi:mongobili@mongo:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "messages",
  })
  .then((result) => {
    // console.log(result);
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
