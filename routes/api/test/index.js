const express = require("express");
const router = express.Router();
const testController = require("./controller");

router.get("/", testController.getTests);

module.exports = router;
