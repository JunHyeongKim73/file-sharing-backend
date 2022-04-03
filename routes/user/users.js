var express = require('express');
var router = express.Router();

const userController = require('../../controllers/user-controller');
const tokenChecker = require('../../middlewares/token-checker');

/* GET users */
router.get('/', userController.getUsers);

/* POST A User */
router.post('/', tokenChecker, userController.postUser);

/* PUT A User */
router.put('/:userId', tokenChecker, userController.putUser);

/* DELETE A User */
router.delete('/:userId', tokenChecker, userController.deleteUser);

module.exports = router;
