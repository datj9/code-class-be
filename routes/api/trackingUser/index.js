const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../../middlewares/auth");
const trackingUserController = require("./controller");

router.get("/", authenticate, authorize(["admin"]), trackingUserController.getTrackings);

module.exports = router;
