const express = require("express");
const router = express.Router();
const tutorialController = require("./controller");
const { authenticate, authorize } = require("../../../middlewares/auth");
const { uploadSingleImage } = require("../../../middlewares/upload");

router.get("/", tutorialController.getTutorials);
router.get("/:tutorialId", tutorialController.getTutorialById);
router.post("/upload-image", authenticate, authorize(["admin"]), uploadSingleImage);
router.post("/", authenticate, authorize(["admin"]), tutorialController.createTutorial);

module.exports = router;
