const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController.js");

router.get("/register", homeController.register);
router.post("/register", homeController.checkRegister);
router.get("/", homeController.home);

module.exports = router;
