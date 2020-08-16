const express = require("express");
const router = express.Router();
const mentorController = require("./controller");
const { authenticate, authorize } = require("../../../middlewares/auth");

router.get("/", authenticate, authorize(["admin"]), mentorController.getMentors);
router.get("/:mentorId", authenticate, authorize(["admin"]), mentorController.getOneMentor);
router.get("/active-mentors", mentorController.getActiveMentors);
router.get("/active-mentors/:mentorId", mentorController.getOneActiveMentor);
router.post("/", authenticate, authorize(["admin"]), mentorController.createMentor);
router.put("/:mentorId", authenticate, authorize(["admin"]), mentorController.updateMentor);
router.delete("/:mentorId", authenticate, authorize(["admin"]), mentorController.deleteMentor);

module.exports = router;
