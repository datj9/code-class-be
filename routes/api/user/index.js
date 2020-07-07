const express = require("express");
const router = express.Router();
const userController = require("./controller");

router.post("/sign-in", userController.signIn);
router.post("/sign-up", userController.signUp);
router.post("/add-tutorial", userController.addTutorial);

module.exports = router;
