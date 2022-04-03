var express = require("express");
var router = express.Router();

const reviewController = require('../../controllers/review-controller');
const tokenChecker = require('../../middlewares/token-checker');

// GET A Review of A File
router.get("/:fileId/reviews/:reviewId", reviewController.getReview);

// GET Reviews of A File
router.get("/:fileId/reviews", reviewController.getReviews);

/* POST A Review of A File */
router.post("/:fileId/reviews", tokenChecker, reviewController.postReview);

/* PUT A Review of A File */
router.put("/:fileId/reviews/:reviewId", tokenChecker, reviewController.putReview);

/* DELETE A Review of A File */
router.delete("/:fileId/reviews/:reviewId", tokenChecker, reviewController.deleteReview);

module.exports = router;
