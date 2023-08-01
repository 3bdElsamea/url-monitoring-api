const express = require("express");
const { config } = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

const router = require("./routes");
const app = express();

config();

// Middlewares
app.use(cors());
app.options("*", cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Morgan
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use(router);

module.exports = app;
