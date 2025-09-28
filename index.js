const express = require("express");
const path = require("path");
const fs = require("fs");
const {
  makeDirIsNotExists
} = require("./utils/functions");
const connection = require("./routes/connection");
const uploader = require("./routes/uploader");
const clear = require("./routes/clear");
const PORT = 8000;
const app = express();
makeDirIsNotExists(path.join(__dirname, "uploads"));
makeDirIsNotExists(path.join(__dirname, "session"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/connect", connection);
app.use("/upload", uploader);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/clear", clear);
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});