var express = require("express");
var router = express.Router();

const reviewController = require('../../controllers/review-controller');
const tokenChecker = require('../../middlewares/token-checker');
const authorityChecker = require('../../middlewares/authority-checker');

// GET A Review of A File
router.get("/:fileId/reviews/:reviewId", reviewController.getReview);

// GET Reviews of A File
router.get("/:fileId/reviews", reviewController.getReviews);

/* POST A Review of A File */
router.post("/:fileId/reviews", tokenChecker.checkAccessToken, authorityChecker, reviewController.postReview);

/* PUT A Review of A File */
router.put("/:fileId/reviews/:reviewId", tokenChecker.checkAccessToken, authorityChecker, reviewController.putReview);

/* DELETE A Review of A File */
router.delete("/:fileId/reviews/:reviewId", tokenChecker.checkAccessToken, authorityChecker, reviewController.deleteReview);

module.exports = router;
