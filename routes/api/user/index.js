const express = require("express");
const router = express.Router();
const userController = require("./controller");
const { authenticate } = require("../../../middlewares/auth");

router.get("/get-saved-tutorials", authenticate, userController.getSavedTutorials);
router.post("/sign-in", userController.signIn);
router.post("/sign-up", userController.signUp);
router.post("/save-tutorial", authenticate, userController.addTutorial);

module.exports = router;
