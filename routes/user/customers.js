var express = require('express');
var router = express.Router();

const userController = require('../../controllers/user-controller');
const tokenChecker = require('../../middlewares/token-checker');

/* GET cutomers */
router.get('/', tokenChecker, userController.getCustomers);

module.exports = router;
