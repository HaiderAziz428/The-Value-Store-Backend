const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const reviewsApi = require("../db/api/reviews");
const { handleError } = require("../helpers");

router.get("/reviews", reviewsApi.list);

router.get("/reviews/:id", reviewsApi.get);

router.post("/reviews", reviewsApi.create);

router.put("/reviews/:id", reviewsApi.update);

router.delete("/reviews/:id", reviewsApi.delete);

// Get reviews by product with statistics
router.get("/reviews/product/:productId", reviewsApi.listByProduct);

module.exports = router;
