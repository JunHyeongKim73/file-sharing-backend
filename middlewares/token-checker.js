const mysqlObj = require('../config/mysql');
const conn = mysqlObj.init();

const {
	verifyAccessToken,
	verifyRefreshToken,
	signToken,
} = require('../utils/jwt');

const checkToken = async (req, res, next) => {
	const data = {};
	// Access 토큰이 없는 경우
	if (req.cookies.accessToken === undefined) {
		data['success'] = false;
		data['message'] = 'Your token is not valid';
		return res.status(401).json(data);
	}

	const accessToken = verifyAccessToken(req.cookies.accessToken);
	const refreshToken = await verifyRefreshToken(req.cookies.refreshToken);

	if (accessToken == null) {
		// Access 토큰과 Refresh 토큰 모두 만료
		if (refreshToken == null) {
			data['success'] = false;
			data['message'] = 'Your token is not valid';
			res.status(401).json(data);
		}
		// Access 토큰 만료. Refresh 토큰 유효.
		// 새로운 Access 토큰 발행
		else {
			const userId = refreshToken['id'];
			const typeId = refreshToken['type'];

			const payload = {
				id: userId,
				type: typeId,
			};
			const newAccessToken = signToken(payload, 'access');

			res.cookie('accessToken', newAccessToken);
			req.cookies.accessToken = newAccessToken;

			req.ID = userId;
			req.TYPE_ID = typeId;
			next();
		}
	} else {
		// Access 토큰 유효. Refresh 토큰만 만료
		// 새로운 Refresh 토큰 발행
		if (refreshToken == null) {
			const userId = accessToken['id'];
			const typeId = accessToken['type'];
			const payload = {
				id: userId,
				type: typeId,
			};
			const newRefreshToken = signToken(payload, 'refresh');
			const refreshSQL = `UPDATE tokens SET token_num='${newRefreshToken}' WHERE id='${userId}'`;
			await conn.query(refreshSQL);

			res.cookie('refreshToken', newRefreshToken);
			req.cookies.refreshToken = newRefreshToken;

			req.ID = userId;
			req.TYPE_ID = typeId;
			next();
		}
		// Access 토큰 유효. Refresh 토큰 유효
		else {
			const userId = accessToken['id'];
			const typeId = accessToken['type'];

			req.ID = userId;
			req.TYPE_ID = typeId;
			next();
		}
	}
};

module.exports = checkToken;
