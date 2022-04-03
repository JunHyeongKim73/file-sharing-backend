var express = require('express');
var router = express.Router();

const fileController = require('../../controllers/file-controller');
const tokenChecker = require('../../middlewares/token-checker');

/* GET Contents of A file */
router.get('/:fileId/content', fileController.getFileContent);

/**
 * GET Data of A file
 * 이미지, 동영상, 문서 등의 데이터를 보낸다
 */
router.get('/:fileId/data', fileController.getFileData);

/**
 * GET files
 * 파일들의 정보를 보낸다
 * 카테고리별, 셀러별, 이름별 검색 가능
 */
router.get('/', fileController.getFiles);

/* POST A file */
router.post('/', tokenChecker, fileController.fileMiddleWare, fileController.postFile);

/* PUT A file */
router.put('/:fileId', tokenChecker, fileController.fileMiddleWare, fileController.putFile);

/* DELETE A file */
router.delete('/:fileId', tokenChecker, fileController.deleteFile);

module.exports = router;
