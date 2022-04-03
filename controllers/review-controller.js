// MySQL DB 연결 모듈
const mysqlObj = require('../config/mysql.js');
const conn = mysqlObj.init();
// 에러 핸들러
const errorHandlers = require('../utils/error-handler');

// GET A Review of A File
const getReview = async (req, res, next) => {
	const data = {};
	const sql = `SELECT * FROM reviews WHERE id='${req.params.reviewId}' and file_id=${req.params.fileId}`;
	try {
		const [result, fields] = await conn.query(sql);
		if (result.length == 0) throw new Error('NoReviewError');

		data['success'] = true;
		data['data'] = result[0];
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

// GET Reviews of A File
const getReviews = async (req, res, next) => {
	const data = {};
	const sql = `SELECT * FROM reviews WHERE file_id=${req.params.fileId}`;
	try {
		const [result, fields] = await conn.query(sql);
		if (result.length == 0) throw new Error('NoReviewError');

		data['success'] = true;
		data['data'] = result;
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* POST A Review of A File */
const postReview = async (req, res, next) => {
	const data = {};
	try {
		// Body에 purchase_id, content, star가 포함되어 있어야 한다
		if (!req.body.purchase_id || !req.body.content || !req.body.star) {
			throw Error('BodyFormatError');
		}
		// star의 값이 5를 초과할 수 없다
		if (req.body.star > 5) {
			throw Error('StarValueError');
		}
		const curTime = new Date(+new Date() + 3240 * 10000)
			.toISOString()
			.replace(/T/, ' ')
			.replace(/\..+/, '');
		sql = `INSERT INTO reviews(id, file_id, content, star, date)
        VALUES('${req.body.purchase_id}', ${req.params.fileId}, '${req.body.content}', ${req.body.star}, '${curTime}')`;

		[result, fields] = await conn.query(sql);
		req.body.file_id = req.params.fileId;
		req.body.date = curTime;

		data['success'] = true;
		data['data'] = req.body;
		res.status(201).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* PUT A Review of A File */
const putReview = async (req, res, next) => {
	const data = {};
	try {
		// Body에 content와 star가 포함되어 있어야 한다
		if (!req.body.content || !req.body.star) {
			throw Error('BodyFormatError');
		}
		// star의 값이 5를 초과할 수 없다
		if (req.body.star > 5) {
			throw Error('StarValueError');
		}
		const sql = `UPDATE reviews
		SET content='${req.body.content}', star=${req.body.star}
		WHERE id='${req.params.reviewId}' and file_id=${req.params.fileId}`;

		const [result, fields] = await conn.query(sql);
		if (result.affectedRows == 0) throw Error('NoReviewError');

		data['success'] = true;
		data['message'] = 'A Review was updated';

		res.status(201).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* DELETE A Review of A File */
const deleteReview = async (req, res, next) => {
	const data = {};

	try {
		const sql = `DELETE FROM reviews WHERE id='${req.params.reviewId}' and file_id=${req.params.fileId}`;
		const [result, fields] = await conn.query(sql);
		if (result.affectedRows == 0) throw Error('NoReviewError');

		data['success'] = true;
		data['message'] = 'A file was successfully deleted';
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

module.exports = {
	getReview,
	getReviews,
	postReview,
	putReview,
	deleteReview,
};
