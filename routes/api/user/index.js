const express = require("express");
const router = express.Router();
const userController = require("./controller");
const { authenticate } = require("../../../middlewares/auth");

router.get("/saved-tutorials", authenticate, userController.getSavedTutorials);
router.get("/search", userController.searchUser);
router.post("/save-tutorial", authenticate, userController.addTutorial);
router.put("/", authenticate, userController.updateUserInfo);
router.patch("/change-password", authenticate, userController.changePassword);

module.exports = router;
