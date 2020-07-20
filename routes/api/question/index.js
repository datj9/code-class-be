const express = require("express");
const router = express.Router();
const questionController = require("./controller");

router.post("/", questionController.createQuestion);

module.exports = router;
