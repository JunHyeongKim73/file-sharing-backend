var express = require('express');
var router = express.Router();

const userController = require('../../controllers/user-controller');

/* GET sellers */
router.get('/', userController.getSellers);

module.exports = router;