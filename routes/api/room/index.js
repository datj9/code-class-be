const express = require("express");
const router = express.Router();
const roomController = require("./controller");
const { authenticate } = require("../../../middlewares/auth");

router.get("/", authenticate, roomController.getRooms);
router.get("/:roomId", authenticate, roomController.getRoomById);
router.post("/", authenticate, roomController.createRooms);
router.post("/connect-mentor", authenticate, roomController.connectMentor);

module.exports = router;
