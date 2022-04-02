// 파일 송수신을 위한 모듈
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, 'uploads/');
		},
		filename: (req, file, cb) => {
			cb(null, new Date().valueOf() + path.extname(file.originalname));
		},
	}),
});

// 데이터베이스 연결을 위한 모듈
const mysqlObj = require('../../config/mysql.js');
const conn = mysqlObj.init();

// 에러 핸들러
const errorHandlers = require('../../utils/error-handler.js');

const fileMiddleWare = upload.single('file');

/* GET Contents of A file */
const getFileContent = async (req, res, next) => {
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
 * GET Data of A file
 * 이미지, 동영상, 문서 등의 데이터를 보낸다
 */
const getFileData = async (req, res, next) => {
	const sql = `SELECT * FROM files WHERE id='${req.params.fileId}'`;
	const path = '/home/rla5764v/file-sharing-backend/';
	try {
		let [result, fields] = await conn.query(sql);
		res.status(200).sendFile(path + result[0]['path']);
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
		if (!req.body.name || !req.body.description || !req.body.price) {
			throw Error('BodyFormatError');
		}
		const path = '/home/rla5764v/file-sharing-backend/';
		// 프론트로부터 받은 파일 데이터
		const fileData = req.file;

		// 파일 정보만 바꾼다
		if (fileData === undefined) {
			let sql = `UPDATE files
            SET name='${req.body.name}', description='${req.body.description}', price=${req.body.price}
            WHERE id='${req.params.fileId}'`;

			let [result, field] = await conn.query(sql);
			if (result['affectedRows'] == 0) throw Error('NoFileError');

			sql = `SELECT * FROM files WHERE id='${req.params.fileId}'`;
			[result, field] = await conn.query(sql);

			data['success'] = true;
			data['message'] = result[0];
			res.status(201).json(data);
		}
		// 파일 자체를 바꾼다
		else {
			let sql = `SELECT path FROM files WHERE id='${req.params.fileId}'`;

			let [result, fields] = await conn.query(sql);

			if (result.length == 0) {
				await fs.unlink(path + fileData['path']);
				throw Error('NoFileError');
			}
			// 원래 파일을 지운다
			await fs.unlink(path + result[0]['path']);

			sql = `UPDATE files
            SET name='${req.body.name}', extension='${fileData['mimetype']}', description='${req.body.description}', 
            price=${req.body.price}, path='${fileData['path']}'
            WHERE id='${req.params.fileId}'`;

			[result, fields] = await conn.query(sql);

			data['success'] = true;
			data['message'] = result;
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

		const path = '/home/rla5764v/file-sharing-backend/';
		// 해당 파일을 스토리지에서 삭제한다
		await fs.unlink(path + result[0]['path']);
		// 해당 파일을 DB에서 삭제한다
		sql = `DELETE FROM files WHERE id='${req.params.fileId}'`;
		[result, fields] = await conn.query(sql);

		data['success'] = true;
		data['message'] = 'A file was successfully deleted';
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

module.exports = {
    fileMiddleWare,
	getFileContent,
	getFileData,
	getFiles,
	postFile,
	putFile,
	deleteFile,
};
