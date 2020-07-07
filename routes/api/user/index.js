const express = require("express");
const router = express.Router();
const userController = require("./controller");
const { authenticate } = require("../../../middlewares/auth");

router.post("/sign-in", userController.signIn);
router.post("/sign-up", userController.signUp);
router.post("/add-tutorial", authenticate, userController.addTutorial);

module.exports = router;
