const express = require("express");
const router = express.Router();

router.use("/tutorials", require("./tutorial"));
router.use("/auth", require("./user"));
router.use("/trackings", require("./trackingUser"));

module.exports = router;
