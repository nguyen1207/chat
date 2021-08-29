const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController.js");
const redirectLogin = require("../middlewares/redirectLogin.js");
const redirectHome = require("../middlewares/redirectHome.js");

router.get("/register", redirectHome, homeController.register);
router.post("/register", redirectHome, homeController.checkRegister);
router.get("/login", redirectHome, homeController.login);
router.post("/login", redirectHome, homeController.checkLogin);
router.post("/logout", redirectLogin, homeController.logout);
router.post("/create", redirectLogin, homeController.create);
router.post("/join", redirectLogin, homeController.join)
router.post("/leave", redirectLogin, homeController.leave);
router.get("/:roomId", redirectLogin, homeController.room);
router.get("/", redirectLogin, homeController.home);

module.exports = router;
