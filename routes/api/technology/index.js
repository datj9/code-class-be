const router = require("express").Router();
const technologyController = require("./controller");

router.get("/", technologyController.getTechnologies);

module.exports = router;
