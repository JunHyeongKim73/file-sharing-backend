const mysqlObj = require('../config/mysql');
const conn = mysqlObj.init();

const {
	verifyAccessToken,
	verifyRefreshToken,
	signToken,
} = require('../utils/jwt');

const checkAccessToken = async (req, res, next) => {
	const data = {};

	// Access 토큰이 없는 경우
	if (req.headers.authorization === undefined) {
		data['success'] = false;
		data['message'] = 'Please set your token';
		return res.status(401).json(data);
	}

	const accessTokenString = (req.headers.authorization).replace('Bearer ', "");
	const accessToken = verifyAccessToken(accessTokenString);
	
	// Access 토큰 만료
	if(accessToken == null) {
		data['success'] = false;
		data['message'] = 'Your token is not valid';
		return res.status(401).json(data);
	}

	const userId = accessToken['id'];
	const typeId = accessToken['type'];

	req.ID = userId;
	req.TYPE_ID = typeId;

	next();
}

const checkRefreshToken = async (req, res, next) => {
	const data = {};

	const refreshToken = await verifyRefreshToken(req.cookies.refreshToken);

	// Refresh 토큰 만료
	if(refreshToken == null) {
		data['success'] = false;
		data['message'] = 'Your token is not valid';
		return res.status(401).json(data);
	}
	
	const userId = refreshToken['id'];
	const typeId = refreshToken['type'];

	req.ID = userId;
	req.TYPE_ID = typeId;

	next();
};

module.exports = {
	checkAccessToken,
	checkRefreshToken
}
