// 파일 송수신을 위한 모듈
const fs = require('fs/promises');

// 데이터베이스 연결을 위한 모듈
const mysqlObj = require('../config/mysql.js');
const conn = mysqlObj.init();

// 에러 핸들러
const errorHandlers = require('../utils/error-handler.js');
const deleteGCSFile = require('../utils/gcs-handler');

/* GET Contents of A file */
const getFile = async (req, res, next) => {
	const sql = `SELECT * FROM files WHERE id='${req.params.fileId}'`;
	const data = {};
	try {
		let [result, fields] = await conn.query(sql);

		data['success'] = true;
		data['data'] = result[0];
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/**
 * GET files
 * 파일들의 정보를 보낸다
 * 카테고리별, 셀러별, 이름별 검색 가능
 */
const getFiles = async (req, res, next) => {
	let sql = `SELECT * FROM files`;
	if (req.query.category_id)
		sql += ` WHERE category_id=${req.query.category_id}`;
	else if (req.query.seller_id)
		sql += ` WHERE seller_id='${req.query.seller_id}'`;
	else if (req.query.name) sql += ` WHERE name LIKE '%${req.query.name}%'`;

	const data = {};
	try {
		let [result, fields] = await conn.query(sql);
		if (result.length == 0) throw Error('NoFileError');

		data['success'] = true;
		data['data'] = result;
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* POST A file */
const postFile = async (req, res, next) => {
	const data = {};
	try {
		if (
			!req.body.name ||
			!req.body.description ||
			!req.body.price ||
			!req.body.seller_id ||
			!req.body.category_id
		) {
			throw Error('BodyFormatError');
		}
		// 프론트로부터 받은 파일 데이터
		if (!req.file) {
			throw Error('NoFileError');
		}

		const fileData = req.file;

		const nowTime = new Date(+new Date() + 3240 * 10000)
			.toISOString()
			.replace(/T/, ' ')
			.replace(/\..+/, '');

		const sql = `INSERT INTO files(seller_id, category_id, name, extension, description, price, path, date)
        VALUES('${req.body.seller_id}', ${req.body.category_id}, '${req.body.name}', '${fileData['mimetype']}', 
        '${req.body.description}', '${req.body.price}', '${fileData['path']}', '${nowTime}')`;

		const [result, fields] = await conn.query(sql);
		req.body.id = result['insertId'];
		req.body.extension = fileData['mimetype'];
		req.body.path = fileData['path'];
		req.body.date = nowTime;

		data['success'] = true;
		data['data'] = req.body;
		res.status(201).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* PUT A file */
const putFile = async (req, res, next) => {
	const data = {};
	try {
		if (
			!req.body.name ||
			!req.body.description ||
			!req.body.price ||
			!req.body.category_id
		) {
			throw Error('BodyFormatError');
		}
		// 프론트로부터 받은 파일 데이터
		const fileData = req.file;

		// 파일 정보만 바꾼다
		if (fileData === undefined) {
			let sql = `UPDATE files
            SET name='${req.body.name}', description='${req.body.description}', price=${req.body.price}, category_id=${req.body.category_id}
            WHERE id='${req.params.fileId}'`;

			let [result, field] = await conn.query(sql);
			if (result['affectedRows'] == 0) throw Error('NoFileError');

			data['success'] = true;
			data['message'] = 'A file was successfully updated';
			res.status(201).json(data);
		}
		// 파일 자체를 바꾼다
		else {
			// 원래 파일을 지운다
			let sql = `SELECT path FROM files WHERE id='${req.params.fileId}'`;
			let [result, fields] = await conn.query(sql);
			if (result.length == 0) throw Error('NoFileError');

			// GCS에서 파일을 삭제한다
			deleteGCSFile(result[0]['path']);

			// DB를 업데이트 한다
			sql = `UPDATE files
            SET name='${req.body.name}', extension='${fileData['mimetype']}', description='${req.body.description}', category_id=${req.body.category_id}, 
            price=${req.body.price}, path='${fileData['path']}'
            WHERE id='${req.params.fileId}'`;
			
			await conn.query(sql);

			data['success'] = true;
			data['message'] = 'A file was successfully updated';
			res.status(201).json(data);
		}
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* DELETE A file */
const deleteFile = async (req, res, next) => {
	const data = {};

	try {
		let sql = `SELECT path FROM files WHERE id='${req.params.fileId}'`;
		let [result, fields] = await conn.query(sql);
		if (result.length == 0) throw Error('NoFileError');

		// GCS에서 파일을 삭제한다
		deleteGCSFile(result[0]['path']);
		// DB에서 파일을 삭제한다
		sql = `DELETE FROM files WHERE id='${req.params.fileId}'`;
		await conn.query(sql);

		data['success'] = true;
		data['message'] = 'A file was successfully deleted';
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

module.exports = {
	getFile,
	getFiles,
	postFile,
	putFile,
	deleteFile,
};
