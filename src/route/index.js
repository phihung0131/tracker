const express = require("express");
const router = express.Router();

const nodeRoutes = require("./nodeRoutes");
const fileRoutes = require("./fileRoutes");

router.use("/", nodeRoutes);
router.use("/", fileRoutes);

module.exports = router;
