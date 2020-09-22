const express = require("express");
const router = express.Router();
const userController = require("./controller");
const { authenticate } = require("../../../middlewares/auth");
const { uploadSingleImage } = require("../../../middlewares/upload");

router.get("/saved-articles", authenticate, userController.getSavedArticles);
router.get("/search", userController.searchUser);
router.post("/save-article", authenticate, userController.addArticle);
router.post("/upload-profile", authenticate, uploadSingleImage);
router.put("/", authenticate, userController.updateUserInfo);
router.patch("/change-password", authenticate, userController.changePassword);

module.exports = router;
