const { v1: uuidv1 } = require('uuid');

const checkUserRequest = require('../utils/user-request');
const errorHandlers = require('../utils/error-handler');
const { signToken } = require('../utils/jwt.js');

const mysqlObj = require('../config/mysql.js');
const conn = mysqlObj.init();

/**
 * User Controller
 */
/* GET users */
const getUsers = async (req, res, next) => {
	const sql = `SELECT * FROM users`;
	const data = {};
	try {
		let [result, fields] = await conn.query(sql);
		if (result.length == 0) throw Error('NoUserError');

		data['success'] = true;
		data['data'] = result;
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* POST users */
const postUser = async (req, res, next) => {
	const data = {};
	try {
		if (checkUserRequest(req, 'post')) throw Error('BodyFormatError');
		const newId = uuidv1();
		let sql = `INSERT INTO users(id, email, password, name, age, type_id)
        VALUES ('${newId}', '${req.body.email}', '${req.body.password}', '${req.body.name}', '${req.body.age}', '${req.body.type_id}')`;
		// users 테이블에 추가
		await conn.query(sql);

		// customers 테이블 입력 쿼리
		if (req.body.type_id == 1) {
			sql = `INSERT INTO customers(id, nickname)
            VALUES('${newId}', '${req.body.nickname}')`;
		}
		// sellers 테이블 입력 쿼리
		else {
			sql = `INSERT INTO sellers(id, bank, account)
            VALUES('${newId}', '${req.body.bank}', '${req.body.account}')`;
		}
		// 입력 쿼리
		await conn.query(sql);

		// Access 토큰과 Refresh 토큰을 발행한다
		const payload = {
			id: newId,
			type: req.body.type_id,
		};

		// Refresh 토큰 DB에 저장
		const refreshToken = signToken(payload, 'refresh');
		const refreshSQL = `INSERT INTO tokens(id, token_num) VALUES('${newId}', '${refreshToken}')`;
		await conn.query(refreshSQL);

		// Access 토큰 발행
		const accessToken = signToken(payload, 'access');
		
		req.body.id = newId;

		data['success'] = true;
		data['data'] = req.body;
		data['accessToken'] = accessToken;
		
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true
		});
		res.status(201).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* Check Whether same email exists */
const checkUserEmail = async (req, res, next) => {
	const data = {};
	const sql = `SELECT email FROM users WHERE email='${req.body.email}'`;
	try{
		const [result, fields] = await conn.query(sql);
		if(result.length != 0) {
			throw Error('SameEmailError');
		}

		data['success'] = true;
		data['message'] = 'Available Email';
		res.status(200).json(data);
	} catch(e) {
		errorHandlers(e, res);
	}
};

/* PUT users */
const putUser = async (req, res, next) => {
	const data = {};

	try {
		if (checkUserRequest(req, 'put')) throw Error('BodyFormatError');

		let sql = `UPDATE users
        SET password='${req.body.password}', name='${req.body.name}', age='${req.body.age}'
        WHERE id='${req.params.userId}'`;
		// users 테이블에 추가
		const [result, fields] = await conn.query(sql);
		const isUpdated = result['affectedRows'] >= 1;
		if (!isUpdated) throw Error('NoUserError');

		// customers 테이블 입력 쿼리
		if (req.body.type_id == 1) {
			sql = `UPDATE customers
            SET nickname='${req.body.nickname}'
            WHERE id='${req.params.userId}'`;
		}
		// sellers 테이블 입력 쿼리
		else {
			sql = `UPDATE sellers
            SET bank='${req.body.bank}', account='${req.body.account}'
            WHERE id='${req.params.userId}'`;
		}

		// customers 테이블 혹은 sellers 테이블을 업데이트한다
		await conn.query(sql);

		// req.body에 userId를 추가해서 반환한다
		data['success'] = true;
		req.body.id = req.params.userId;
		data['data'] = req.body;
		res.status(201).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* DELETE users */
const deleteUser = async (req, res, next) => {
	const data = {};
	const sql = `DELETE FROM users WHERE id='${req.params.userId}'`;

	try {
		const [result, fields] = await conn.query(sql);
		const isDeleted = result['affectedRows'] >= 1;
		if (!isDeleted) throw Error('NoUserError');

		data['success'] = true;
		data['message'] = 'A user was successfully deleted';
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/**
 * Customer Controller
 */

/* GET cutomers */
const getCustomers = async (req, res, next) => {
	const sql = `SELECT *
	FROM users
	JOIN customers USING(id)`;
	const data = {};

	try {
		let [result, fields] = await conn.query(sql);
		if (result.length == 0) throw Error('NoCustomerError');

		data['success'] = true;
		data['data'] = result;
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/**
 * Seller Controller
 */

/* GET sellers */
const getSellers = async (req, res, next) => {
	const sql = `SELECT *
	FROM users
	JOIN sellers USING(id)`;
	const data = {};

	try {
		let [result, fields] = await conn.query(sql);
		if (result.length == 0) throw Error('NoSellerError');

		data['success'] = true;
		data['data'] = result;
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

module.exports = {
	getUsers,
	postUser,
	checkUserEmail,
	putUser,
	deleteUser,
	getCustomers,
	getSellers,
};
