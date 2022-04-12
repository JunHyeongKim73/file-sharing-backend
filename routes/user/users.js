var express = require('express');
var router = express.Router();

const userController = require('../../controllers/user-controller');
const tokenChecker = require('../../middlewares/token-checker');
const authorityChecker = require('../../middlewares/authority-checker');

/* GET users */
router.get('/', tokenChecker.checkAccessToken, authorityChecker, userController.getUsers);

/* POST A User */
router.post('/', userController.postUser);

/* Check Whether same email exists */
router.post('/check-email', userController.checkUserEmail);

/* PUT A User */
router.put('/:userId', tokenChecker.checkAccessToken, authorityChecker, userController.putUser);

/* DELETE A User */
router.delete('/:userId', tokenChecker.checkAccessToken, userController.deleteUser);

module.exports = router;
