var express = require("express");
var router = express.Router();

const reviewController = require('./review-controller');

// GET A Review of A File
router.get("/:fileId/reviews/:reviewId", reviewController.getReview);

// GET Reviews of A File
router.get("/:fileId/reviews", reviewController.getReviews);

/* POST A Review of A File */
router.post("/:fileId/reviews", reviewController.postReview);

/* PUT A Review of A File */
router.put("/:fileId/reviews/:reviewId", reviewController.putReview);

/* DELETE A Review of A File */
router.delete("/:fileId/reviews/:reviewId", reviewController.deleteReview);

module.exports = router;
