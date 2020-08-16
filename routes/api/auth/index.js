const express = require("express");
const router = express.Router();
const authController = require("./controller");

router.post("/sign-in", authController.signIn);
router.post("/sign-up", authController.signUp);

module.exports = router;
