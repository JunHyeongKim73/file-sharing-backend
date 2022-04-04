// 데이터베이스 연결을 위한 모듈
const mysqlObj = require('../config/mysql.js');
const conn = mysqlObj.init();

const checkAuthority = async (req, res, next) => {
	switch (req.baseUrl) {
		case '/users':
			if (req.method == 'GET') {
				if (req.TYPE_ID != 3) {
					return res.status(403).json({ success: false });
				}
			} else if (req.method == 'PUT' || req.method == 'DELETE') {
				if (req.params.userId != req.ID) {
					return res.status(403).json({ success: false });
				}
			}
			break;

		case '/customers':
		case '/sellers':
			if (req.method == 'GET' && req.TYPE_ID != 3) {
				return res.status(403).json({ success: false });
			}
			break;

		case '/files':
			const filePath = req.route.path.toString();

			// Review API
			if (filePath.includes('review')) {
				if (req.method == 'POST' && req.TYPE_ID != 1) {
					return res.status(403).json({ success: false });
				} else if (req.method == 'PUT' || req.method == 'DELETE') {
					/**
					 * purchases + reviews 테이블에서 API 호출자의 리뷰 리스트를 가져온다
					 * 리뷰 리스트 중에 요청한 리뷰가 있는지 확인하고 없으면 403 오류를 반환한다
					 */
					const sql = `SELECT id FROM purchases JOIN reviews USING(id) WHERE customer_id='${req.ID}'`;
					const [result, fields] = await conn.query(sql);

					var reviewList = [];
					for (var data of result) {
						reviewList.push(data['id'].toString());
					}

					if (!reviewList.includes(req.params.reviewId)) {
						return res.status(403).json({ success: false });
					}
				}
			}

			// File API
			else if (req.method == 'POST' && req.TYPE_ID != 2) {
				return res.status(403).json({ success: false });
			} else if (req.method == 'PUT' || req.method == 'DELETE') {
				/**
				 * files 테이블에서 API 호출자의 파일 리스트를 가져온다
				 * 파일 리스트 중에 요청한 파일이 있는지 확인하고 없으면 403 오류를 반환한다
				 */
				const sql = `SELECT id FROM files WHERE seller_id='${req.ID}'`;
				const [result, fields] = await conn.query(sql);

				var fileList = [];
				for (var data of result) {
					fileList.push(data['id'].toString());
				}

				if (!fileList.includes(req.params.fileId)) {
					return res.status(403).json({ success: false });
				}
			}
			break;

		case '/purchases':
			if (req.method == 'GET') {
				// 1. 고객별 구매 목록 확인
				if (
					req.query.customer_id != undefined &&
					req.ID != req.query.customer_id
				) {
					return res.status(403).json({ success: false });
				}
				// 2. 셀러별 각 파일의 판매 목록 확인
				else if (
					req.query.seller_id != undefined &&
					req.query.file_id != undefined
				) {
					const sql = `SELECT id FROM files WHERE seller_id='${req.ID}'`;
					const [result, fields] = await conn.query(sql);

					var fileList = [];
					for (var data of result) {
						fileList.push(data['id'].toString());
					}

					if (!fileList.includes(req.query.file_id)) {
						return res.status(403).json({ success: false });
					}
				}
				// 3. 셀러별 모든 판매 목록 확인
				else if (
					req.query.seller_id != undefined &&
					req.ID != req.query.seller_id
				) {
					return res.status(403).json({ success: false });
				}
			} else if (req.method == 'POST' && req.TYPE_ID != 1) {
				return res.status(403).json({ success: false });
			}
			break;
	}

	next();
};

module.exports = checkAuthority;
