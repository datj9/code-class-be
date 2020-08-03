const express = require("express");
const router = express.Router();

router.use("/tutorials", require("./tutorial"));
router.use("/auth", require("./user"));
router.use("/trackings", require("./trackingUser"));
router.use("/tests", require("./test"));
router.use("/questions", require("./question"));
router.use("/tasks", require("./task"));

module.exports = router;
