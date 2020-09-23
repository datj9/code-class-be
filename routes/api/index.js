const express = require("express");
const router = express.Router();

router.use("/articles", require("./article"));
router.use("/technologies", require("./technology"));
router.use("/auth", require("./auth"));
router.use("/users", require("./user"));
router.use("/trackings", require("./trackingUser"));
router.use("/tests", require("./test"));
router.use("/questions", require("./question"));
router.use("/tasks", require("./task"));
router.use("/rooms", require("./room"));
router.use("/mentors", require("./mentor"));
router.use("/words", require("./word"));

module.exports = router;
