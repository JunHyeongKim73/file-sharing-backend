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
		// 이메일 혹은 비밀번호 불일치
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

		// Refresh 토큰 DB에 저장
		const SQL = `INSERT INTO tokens(id, token_num) VALUES('${userId}', '${refreshToken}')`;
		await conn.query(SQL);

		// Access토큰 발행
		const accessToken = signToken(payload, 'access');

		data['success'] = true;
		data['message'] = '로그인 되었습니다';
		data['accessToken'] = accessToken;

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
		});
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/**
 * 로그아웃 API
 * userID를 인자로 받는다
 * 해당 유저의 Refresh 토큰을 DB에서 삭제한다
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

		res.clearCookie('refreshToken');
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/**
 * 토큰 재발급 API
 * refresh 토큰이 유효한 경우에만 refresh 모듈이 실행된다
 * userID를 인자로 받는다
 * 새로운 Access, Refresh 토큰이 발급된다
 * Refresh 토큰은 DB에 저장된다
 */
const refresh = async (req, res, next) => {
	const data = {};
	try {
		// 유저 타입을 DB로부터 받아오는 쿼리
		const sql = `SELECT type_id FROM users WHERE id='${req.ID}'`;
		let [result, fields] = await conn.query(sql);
		
		const userType = result[0].type_id;

		const payload = {
			id: req.ID,
			type: userType,
		};
		const refreshToken = signToken(payload, 'refresh');

		// Refresh 토큰 DB에 저장
		const SQL = `UPDATE tokens set token_num='${refreshToken}' WHERE id='${req.ID}'`;
		await conn.query(SQL);

		// Access토큰 발행
		const accessToken = signToken(payload, 'access');

		data['success'] = true;
		data['message'] = 'Access 토큰이 재발급되었습니다';
		data['accessToken'] = accessToken;

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
		});
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
}

module.exports = {
	login,
	logout,
	refresh
};
