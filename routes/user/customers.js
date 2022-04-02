var express = require('express');
var router = express.Router();

const userController = require('./user-controller');

/* GET cutomers */
router.get('/', userController.getCustomers);

module.exports = router;
