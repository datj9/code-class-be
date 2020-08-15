const express = require("express");
const router = express.Router();
const mentorController = require("./controller");
const { authenticate, authorize } = require("../../../middlewares/auth");

router.get("/", mentorController.getMentors);
router.get("/:mentorId", mentorController.getOneMentor);
router.post("/", authenticate, authorize(["admin"]), mentorController.createMentor);
router.put("/:mentorId", authenticate, authorize(["admin"]), mentorController.updateMentor);

module.exports = router;
