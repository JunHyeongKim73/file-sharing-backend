var express = require("express");
var router = express.Router();

const mysqlObj = require("../../config/mysql.js");
const conn = mysqlObj.init();

/**
 * 1. 고객별 구매 목록 확인
 * 2. 셀러별 모든 판매 목록 확인
 * 3. 셀러별 각 파일의 판매 목록 확인
 */
router.get("/purchases", async (req, res, next) => {
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
router.post("/purchases", async (req, res, next) => {
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

/* PUT A file */
router.put("/:fileId", async (req, res, next) => {
	const data = {};
	if (!req.body.name || !req.body.description || !req.body.price) {
		data["success"] = false;
		data["message"] = "Body format is not correct";
		res.status(400).json(data);
	}
	const path = "/home/rla5764v/file-sharing-backend/";
	// 프론트로부터 받은 파일 데이터
	const fileData = req.file;

	// 파일 정보만 바꾼다
	if (fileData === undefined) {
		let sql = `UPDATE files
    SET name='${req.body.name}', description='${req.body.description}', price=${req.body.price}
    WHERE id='${req.params.fileId}'`;
		try {
			let [result, field] = await conn.query(sql);
			if (result["affectedRows"] == 0) throw Error("NoFileException");

			sql = `SELECT * FROM files WHERE id='${req.params.fileId}'`;
			[result, field] = await conn.query(sql);

			data["success"] = true;
			data["message"] = result[0];
			res.status(201).json(data);
		} catch (e) {
			console.error(e);
			data["success"] = false;
			data["message"] = "No Such File";
			res.status(409).json(data);
		}
	}
	// 파일 자체를 바꾼다
	else {
		let sql = `SELECT path FROM files WHERE id='${req.params.fileId}'`;
		try {
			let [result, fields] = await conn.query(sql);

			if (result.length == 0) {
				await fs.unlink(path + fileData["path"]);
				throw Error("NoFileException");
			}
			// 원래 파일을 지운다
			await fs.unlink(path + result[0]["path"]);

			sql = `UPDATE files
      SET name='${req.body.name}', extension='${fileData["mimetype"]}', description='${req.body.description}', 
      price=${req.body.price}, path='${fileData["path"]}'
      WHERE id='${req.params.fileId}'`;

			[result, fields] = await conn.query(sql);
			if (result["affectedRows"] == 0) throw Error();
			res.send("hi");
		} catch (e) {
			data["success"] = false;
			if (e.name == "NoFileException") {
				data["message"] = "No Such File";
				res.status(409).json(data);
			} else {
				data["message"] = "Query Error";
				res.status(400).json(data);
			}
		}
	}
});

/* DELETE A file */
router.delete("/:fileId", async (req, res, next) => {
	const data = {};

	try {
		let sql = `SELECT path FROM files WHERE id='${req.params.fileId}'`;
		let [result, fields] = await conn.query(sql);
		if (result.length == 0) throw Error("NoFileException");

		const path = "/home/rla5764v/file-sharing-backend/";
		// 해당 파일을 스토리지에서 삭제한다
		await fs.unlink(path + result[0]["path"]);
		// 해당 파일을 DB에서 삭제한다
		sql = `DELETE FROM files WHERE id='${req.params.fileId}'`;
		[result, fields] = await conn.query(sql);

		data["success"] = true;
		data["message"] = "A file was successfully deleted";
		res.status(200).json(data);
	} catch (e) {
		console.error(e);
		data["success"] = false;
		data["message"] = "No Such File";
		res.status(409).json(data);
	}
});

module.exports = router;
