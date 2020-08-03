const express = require("express");
const router = express.Router();
const taskController = require("./controller");

router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);

module.exports = router;
