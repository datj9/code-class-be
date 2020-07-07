const express = require("express");
const router = express.Router();

router.use("/tutorials", require("./tutorial"));
router.use("/auth", require("./user"));

module.exports = router;
