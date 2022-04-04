// MySQL DB 연결 모듈
const mysqlObj = require('../config/mysql.js');
const errorHandlers = require('../utils/error-handler.js');
const conn = mysqlObj.init();

/**
 * 1. 고객별 구매 목록 확인
 * 2. 셀러별 모든 판매 목록 확인
 * 3. 셀러별 각 파일의 판매 목록 확인
 */
const getPurchases = async (req, res, next) => {
	const data = {};
	try {
		let sql = `SELECT * FROM purchases`;
		if (req.query.customer_id) {
			sql += ` WHERE customer_id='${req.query.customer_id}'`;
		} else if (req.query.seller_id && req.query.file_id) {
			sql += ` WHERE seller_id='${req.query.seller_id}' AND file_id=${req.query.file_id}`;
		} else if (req.query.seller_id) {
			sql += ` WHERE seller_id='${req.query.seller_id}'`;
		} else {
			throw Error('UrlQueryError');
		}

		const [result, fields] = await conn.query(sql);
		if (result.length == 0) throw new Error('NoPurchaseError');

		data['success'] = true;
		data['data'] = result;
		res.status(200).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

/* POST A Purchase */
const postPurchase = async (req, res, next) => {
	const data = {};
	try {
		if (!req.body.customer_id || !req.body.file_id)
			throw Error('BodyFormatError');

		let sql = `SELECT seller_id, price FROM files WHERE id=${req.body.file_id}`;
		let [result, fields] = await conn.query(sql);
		if (result.length == 0) throw Error('NoFileError');

		const price = result[0]['price'];
		const sellerId = result[0]['seller_id'];
		// 타임스팸프를 이용하여 구매 ID를 생성한다
		const timeStamp = +new Date();
		const purchaseId = 'P' + timeStamp;
		// 현재 시각을 YYYY-MM-DD HH-MM-SS 형식으로 저장한다
		const curTime = new Date(+new Date() + 3240 * 10000)
			.toISOString()
			.replace(/T/, ' ')
			.replace(/\..+/, '');

		sql = `INSERT INTO purchases(id, customer_id, file_id, seller_id, price, date)
        VALUES('${purchaseId}', '${req.body.customer_id}', ${req.body.file_id}, '${sellerId}', ${price}, '${curTime}')`;

		[result, fields] = await conn.query(sql);
		req.body.id = purchaseId;
		req.body.price = price;
		req.body.date = curTime;

		data['success'] = true;
		data['data'] = req.body;
		res.status(201).json(data);
	} catch (e) {
		errorHandlers(e, res);
	}
};

module.exports = {
	getPurchases,
    postPurchase
};
