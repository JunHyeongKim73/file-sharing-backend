var express = require("express");
var router = express.Router();

const mysqlObj = require("../../config/mysql.js");
const conn = mysqlObj.init();

/**
 * 1. 고객별 구매 목록 확인
 * 2. 셀러별 모든 판매 목록 확인
 * 3. 셀러별 각 파일의 판매 목록 확인
 */
router.get("/", async (req, res, next) => {
	const data = {};
	try{
		let sql = `SELECT * FROM purchases`;
		if(req.query.customer_id) {
			sql += ` WHERE customer_id='${req.query.customer_id}'`;
		} else if(req.query.seller_id && req.query.file_id) {
			sql += ` WHERE seller_id='${req.query.seller_id}' AND file_id=${req.query.file_id}`;
		} else if(req.query.seller_id) {
			sql += ` WHERE seller_id='${req.query.seller_id}'`;
		} else {
			throw Error('UrlQueryError');
		}

		const [result, fields] = await conn.query(sql);
		if(result.length == 0) throw new Error('NoPurchaseError');
		
		data['success'] = true;
		data['data'] = result;
		res.status(200).json(data);
	} catch(e) {
		console.error(e);
		data['success'] = false;
		if(e.message == 'NoPurchaseError'){
			data['message'] = 'No Such Purchase';
			res.status(409).json(data);
		}
		else{
			data['message'] = 'Query Error';
			res.status(400).json(data);
		}
	}
});

/* POST A Purchase */
router.post("/", async (req, res, next) => {
	const data = {};
	if(!req.body.customer_id || !req.body.file_id){
		data['success'] = false;
		data['message'] = 'Body Format is not correct';
		res.status(400).json(data);
	}
	let sql = `SELECT seller_id, price FROM files WHERE id=${req.body.file_id}`;
	let [result, fields] = await conn.query(sql);
	const price = result[0]['price'];
	const sellerId = result[0]['seller_id'];
	const timeStamp = +new Date();
	const purchaseId = 'P' + timeStamp;

	const curTime = new Date(+new Date() + 3240 * 10000)
		.toISOString()
		.replace(/T/, " ")
		.replace(/\..+/, "");
	sql = 
	`INSERT INTO purchases(id, customer_id, file_id, seller_id, price, date)
	VALUES('${purchaseId}', '${req.body.customer_id}', ${req.body.file_id}, '${sellerId}', ${price}, '${curTime}')`;

	try {
		[result, fields] = await conn.query(sql);
		req.body.id = purchaseId;
		req.body.price = price;
		req.body.date = curTime;

		data['success'] = true;
		data['data'] = req.body;
		res.status(201).json(data);
	} catch (e) {
		console.error(e);

		data['success'] = false;
		data['message'] = 'Query Error';
		res.status(400).json(data);
	}
});

module.exports = router;
