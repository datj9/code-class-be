const express = require("express");
const router = express.Router();
const taskController = require("./controller");
const { authenticate } = require("../../../middlewares/auth");

router.get("/", authenticate, taskController.getTasks);
router.post("/", authenticate, taskController.createTask);
router.patch("/:id", authenticate, taskController.updateTaskStatus);
router.delete("/:id", authenticate, taskController.deleteTask);

module.exports = router;
