var express = require('express');
var router = express.Router();

const userController = require('../../controllers/user-controller');
const tokenChecker = require('../../middlewares/token-checker');

/* GET sellers */
router.get('/', tokenChecker.checkAccessToken, userController.getSellers);

module.exports = router;