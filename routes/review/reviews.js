var express = require("express");
var router = express.Router();

const mysqlObj = require("../../config/mysql.js");
const conn = mysqlObj.init();

// GET A Review of A File
router.get("/:fileId/reviews/:reviewId", async (req, res, next) => {
	const data = {};
	const sql = `SELECT * FROM reviews WHERE id='${req.params.reviewId}' and file_id=${req.params.fileId}`;
	try{
		const [result, fields] = await conn.query(sql);
		if(result.length == 0) throw new Error('NoReviewError');
		
		data['success'] = true;
		data['data'] = result[0];
		res.status(200).json(data);
	} catch(e) {
		console.error(e);
		data['success'] = false;
		if(e.message == 'NoReviewError'){
			data['message'] = 'No Such Review';
			res.status(409).json(data);
		}
		else{
			data['message'] = 'Query Error';
			res.status(400).json(data);
		}
	}
});

// GET Reviews of A File
router.get("/:fileId/reviews", async (req, res, next) => {
	const data = {};
	const sql = `SELECT * FROM reviews WHERE file_id=${req.params.fileId}`;
	try{
		const [result, fields] = await conn.query(sql);
		if(result.length == 0) throw new Error('NoReviewError');
		
		data['success'] = true;
		data['data'] = result;
		res.status(200).json(data);
	} catch(e) {
		console.error(e);
		data['success'] = false;
		if(e.message == 'NoReviewError'){
			data['message'] = 'No Such Review';
			res.status(409).json(data);
		}
		else{
			data['message'] = 'Query Error';
			res.status(400).json(data);
		}
	}
});

/* POST A Review of A File */
router.post("/:fileId/reviews", async (req, res, next) => {
	const data = {};
	
	try {
		if(!req.body.purchase_id || !req.body.content || !req.body.star) {
			throw Error('BodyFormatError');
		}
        const curTime = new Date(+new Date() + 3240 * 10000)
            .toISOString()
            .replace(/T/, " ")
            .replace(/\..+/, "");
        sql = 
        `INSERT INTO reviews(id, file_id, content, star, date)
        VALUES('${req.body.purchase_id}', ${req.params.fileId}, '${req.body.content}', ${req.body.star}, '${curTime}')`;

		[result, fields] = await conn.query(sql);
		req.body.file_id = req.params.fileId;
		req.body.date = curTime;

		data['success'] = true;
		data['data'] = req.body;
		res.status(201).json(data);
	} catch (e) {
		console.error(e);
		data['success'] = false;
		if(e.message == 'BodyFormatError') {
			data['message'] = 'Body Format is not correct'
			res.status(400).json(data);
		}
		else {
			data['message'] = 'Query Error';
			res.status(400).json(data);
		}
	}
});

/* PUT A Review of A File */
router.put("/:fileId/reviews/:reviewId", async (req, res, next) => {
	const data = {};
	try{
		if(!req.body.content || !req.body.star) {
			throw Error('BodyFormatError');
		}
		const sql = 
		`UPDATE reviews
		SET content='${req.body.content}', star=${req.body.star}
		WHERE id='${req.params.reviewId}' and file_id=${req.params.fileId}`;

		const [result, fields] = await conn.query(sql);
		if(result.affectedRows == 0) throw Error('NoReviewError');

		data['success'] = true;
		data['message'] = 'A Review was updated';

		res.status(201).json(data);
	} catch(e) {
		console.error(e);
		data['success'] = false;
		if(e.message == 'BodyFormatError') {
			data['message'] = 'Body Format is not correct'
			res.status(400).json(data);
		}
		else if(e.message == 'NoReviewError') {
			data['message'] = 'No Such Review';
			res.status(409).json(data);
		}
		else {
			data['message'] = 'Query Error';
			res.status(400).json(data);
		}
	}
		
});

/* DELETE A Review of A File */
router.delete("/:fileId/reviews/:reviewId", async (req, res, next) => {
	const data = {};

	try {
		const sql = `DELETE FROM reviews WHERE id='${req.params.reviewId}' and file_id=${req.params.fileId}`;
		const [result, fields] = await conn.query(sql);
		if(result.affectedRows == 0) throw Error('NoReviewError');

		data["success"] = true;
		data["message"] = "A file was successfully deleted";
		res.status(200).json(data);
	} catch (e) {
		console.error(e);
		data['success'] = false;
		if(e.message == 'NoReviewError') {
			data['message'] = 'No Such Review';
			res.status(409).json(data);
		}
		else {
			data['message'] = 'Query Error';
			res.status(400).json(data);
		}
	}
});

module.exports = router;
