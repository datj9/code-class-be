const express = require("express");
const router = express.Router();
const articleController = require("./controller");
const { authenticate, authorize, checkToken } = require("../../../middlewares/auth");
const { uploadSingleImage } = require("../../../middlewares/upload");

router.get("/", articleController.getArticles);
router.get("/:articleId", checkToken, articleController.getArticleById);
router.post("/upload-image", authenticate, authorize(["admin"]), uploadSingleImage);
router.post("/", authenticate, authorize(["admin"]), articleController.createArticle);
router.put("/:articleId", authenticate, authorize(["admin"]), articleController.updateArticle);
router.patch("/increase-view", articleController.increaseView);
router.delete("/:articleId", authenticate, authorize(["admin"]), articleController.deleteArticle);

module.exports = router;
