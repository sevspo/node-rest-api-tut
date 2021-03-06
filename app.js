const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

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
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

mongoose
  .connect("mongodb://sevi:mongobili@mongo:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "messages",
  })
  .then((result) => {
    // const server = app.listen(8080);
    const http = require("http").createServer(app);

    const io = require("./socket").init(http);

    // this cb will be called for every client that connects to socket io
    io.on("connection", (socket) => {
      console.log("client connected");
    });

    http.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
