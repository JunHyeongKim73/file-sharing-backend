var express = require('express');
var router = express.Router();

const fileController = require('../../controllers/file-controller');

const Multer = require('multer');
const multer = Multer({
	storage: Multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

const tokenChecker = require('../../middlewares/token-checker');
const authorityChecker = require('../../middlewares/authority-checker');
const upload = require('../../middlewares/upload');

/* GET Contents of A file */
router.get('/:fileId', fileController.getFile);

/**
 * GET files
 * 파일들의 정보를 보낸다
 * 카테고리별, 셀러별, 이름별 검색 가능
 */
router.get('/', fileController.getFiles);

/* POST A file */
router.post('/', tokenChecker, authorityChecker, multer.single('file'), upload, fileController.postFile);

/* PUT A file */
router.put('/:fileId', tokenChecker, authorityChecker, multer.single('file'), upload, fileController.putFile);

/* DELETE A file */
router.delete('/:fileId', tokenChecker, authorityChecker, fileController.deleteFile);

module.exports = router;
