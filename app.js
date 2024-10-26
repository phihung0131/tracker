const express = require("express");
const cors = require("cors");

const routes = require("./src/route");
const { connectionDatabase } = require("./src/config/database");

const app = express();

const hostname = "localhost";
const port = 8081;

// Middleware: Enable CORS for specified origin
let corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware: Parse requests with JSON payload
app.use(express.json());

// Middleware: Parse requests with x-www-form-urlencoded content type
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);

// Connect to the database
connectionDatabase();

// Start the server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});