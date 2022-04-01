var express = require("express");
var router = express.Router();

const userController = require('./user-controller');

/* GET users */
router.get("/", userController.getUsers);

/* POST users */
router.post("/", userController.postUser);

/* PUT users */
router.put("/:userId", userController.putUser);

/* DELETE users */
router.delete("/:userId", userController.deleteUser);

module.exports = router;
