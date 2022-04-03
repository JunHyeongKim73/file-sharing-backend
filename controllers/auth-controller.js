const mysqlObj = require('../config/mysql.js');
const conn = mysqlObj.init();
const { signToken } = require('../utils/jwt.js');

const errorHandlers = require('../utils/error-handler.js');

/**
 * 로그인 API
 * 이메일과 아이디를 인자로 받는다
 * Access 토큰과 Refresh 토큰이 발급된다
 * Refresh 토큰은 DB에 저장된다
 */
const login = async (req, res, next) => {
	const data = {};
	try {
		if (!req.body.email || !req.body.password) {
			throw Error('BodyFormatError');
		}

		// 비밀번호 받아오는 쿼리
		const sql = `SELECT * FROM users WHERE email='${req.body.email}'`;
		let [result, fields] = await conn.query(sql);
		password = result[0]['password'];
		// 이메일 / 비밀번호 불일치
		if (req.body.password != password) {
			throw Error('LoginError');
		}
		const userId = result[0].id;
		const userType = result[0].type_id;

		const payload = {
			id: userId,
			type: userType,
		};
		const refreshToken = signToken(payload, 'refresh');

		// 해당 유저가 이미 Refresh 토큰을 발급받았는지 확인
		const checkSQL = `SELECT * FROM tokens WHERE id='${userId}'`;
		[result, fields] = await conn.query(checkSQL);
		if (result.length == 0) {
			// Refresh 토큰 DB에 저장
			const insertRefreshSQL = `INSERT INTO tokens(id, token_num) VALUES('${userId}', '${refreshToken}')`;
			await conn.query(insertRefreshSQL);
		}
		else {
			// Refresh 토큰 업데이트
			const updateRefreshSQL = `UPDATE tokens SET token_num='${refreshToken}' WHERE id='${userId}'`;
			await conn.query(updateRefreshSQL);
		}

		// Access토큰 발행
		const accessToken = signToken(payload, 'access');
		data['success'] = true;
		data['message'] = '로그인 되었습니다';

		res.cookie('accessToken', accessToken);
		res.cookie('refreshToken', refreshToken);
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/**
 * 로그아웃 API
 * userID를 인자로 받는다
 * 해당 유저의 Refresh 토큰을 DB에서 삭제한다
 * 웹 서버에서는 Access 토큰을 쿠키에서 지운다
 */
const logout = async (req, res, next) => {
	const data = {};
	try {
		const sql = `DELETE FROM tokens WHERE id='${req.ID}'`;

		const [result, fields] = await conn.query(sql);
		if (result.affectedRows == 0) {
			throw Error('NoUserError');
		}

		data['success'] = true;
		data['message'] = '로그아웃 되었습니다';

		res.clearCookie('accessToken');
		res.clearCookie('refreshToken');
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

module.exports = {
	login,
	logout,
};
