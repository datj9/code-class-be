const express = require("express");
const router = express.Router();
const userController = require("./controller");
const { authenticate } = require("../../../middlewares/auth");
const { uploadSingleImage } = require("../../../middlewares/upload");

router.get("/saved-tutorials", authenticate, userController.getSavedTutorials);
router.get("/search", userController.searchUser);
router.post("/save-tutorial", authenticate, userController.addTutorial);
router.post("/upload-profile", authenticate, uploadSingleImage);
router.put("/", authenticate, userController.updateUserInfo);
router.patch("/change-password", authenticate, userController.changePassword);

module.exports = router;
