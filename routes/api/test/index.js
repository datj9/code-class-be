const express = require("express");
const router = express.Router();
const testController = require("./controller");

router.get("/", testController.getTests);
router.post("/", testController.createTest);

module.exports = router;
