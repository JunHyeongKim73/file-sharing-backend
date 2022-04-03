var express = require('express');
var router = express.Router();

const purchaseController = require('../../controllers/purchase-controller');
const tokenChecker = require('../../middlewares/token-checker');

/**
 * 1. 고객별 구매 목록 확인
 * 2. 셀러별 모든 판매 목록 확인
 * 3. 셀러별 각 파일의 판매 목록 확인
 */
router.get('/', tokenChecker, purchaseController.getPurchases);

/* POST A Purchase */
router.post('/', tokenChecker, purchaseController.postPurchase);

module.exports = router;
