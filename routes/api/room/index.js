const express = require("express");
const router = express.Router();
const roomController = require("./controller");

router.get("/", roomController.getRooms);
router.get("/:roomId", roomController.getRoomById);
router.post("/", roomController.createRooms);

module.exports = router;
