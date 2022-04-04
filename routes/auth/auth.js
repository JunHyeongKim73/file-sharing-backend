var express = require('express');
var router = express.Router();

const authController = require('../../controllers/auth-controller');
const tokenChecker = require('../../middlewares/token-checker');

/**
 * 로그인 API
 * 이메일과 아이디를 인자로 받는다
 * Access 토큰과 Refresh 토큰이 발급된다
 * Refresh 토큰은 DB에 저장된다
 */
router.post('/login', authController.login);

/**
 * 로그아웃 API
 * userID를 인자로 받는다
 * 해당 유저의 Refresh 토큰을 DB에서 삭제한다
 */
router.post('/logout', tokenChecker, authController.logout);

module.exports = router;