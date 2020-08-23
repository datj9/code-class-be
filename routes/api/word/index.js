const express = require("express");
const router = express.Router();
const wordController = require("./controller");
const { authenticate } = require("../../../middlewares/auth");
const { uploadSingleImage } = require("../../../middlewares/upload");

router.get("/", authenticate, wordController.getWords);
router.get("/:wordId", authenticate, wordController.getWordById);
router.get("/search-word/:word", authenticate, wordController.searchWord);
router.post("/", authenticate, wordController.createWord);
router.patch("/update-remembered/:wordId", authenticate, wordController.updateWordStatus);
router.delete("/:wordId", authenticate, wordController.deleteWord);
router.post("/upload-image", authenticate, uploadSingleImage);

module.exports = router;
