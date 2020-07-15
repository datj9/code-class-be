const express = require("express");
const router = express.Router();
const tutorialController = require("./controller");
const { authenticate, authorize } = require("../../../middlewares/auth");
const { uploadSingleImage } = require("../../../middlewares/upload");

router.get("/", tutorialController.getTutorials);
router.get("/:tutorialId", tutorialController.getTutorialById);
router.post("/upload-image", authenticate, authorize(["admin"]), uploadSingleImage);
router.post("/", authenticate, authorize(["admin"]), tutorialController.createTutorial);
router.put("/:tutorialId", authenticate, authorize(["admin"]), tutorialController.updateTutorial);
router.patch("/increate-view", tutorialController.increaseView);
router.delete("/:tutorialId", authenticate, authorize(["admin"]), tutorialController.deleteTutorial);

module.exports = router;
