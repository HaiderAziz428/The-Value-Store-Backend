const express = require("express");
const ReviewsService = require("../services/reviews");
const ReviewsDBApi = require("../db/api/reviews");
const wrapAsync = require("../helpers").wrapAsync;
const passport = require("passport");
const router = express.Router();

// Create a new review
router.post(
  "/",
  wrapAsync(async (req, res) => {
    await ReviewsService.create(req.body.data, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  })
);

// Get all reviews with filters
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const payload = await ReviewsDBApi.findAll(req.query);

    res.status(200).send(payload);
  })
);

// Get reviews by product ID
router.get(
  "/product/:productId",
  wrapAsync(async (req, res) => {
    const payload = await ReviewsService.findByProductId(req.params.productId);
    res.status(200).send(payload);
  })
);

// Get a specific review by ID
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const payload = await ReviewsDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  })
);

// Update a review
router.put(
  "/:id",
  wrapAsync(async (req, res) => {
    await ReviewsService.update(req.body.data, req.params.id, req.currentUser);

    const payload = true;
    res.status(200).send(payload);
  })
);

// Delete a review (admin only)
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    await ReviewsService.remove(req.params.id, req.currentUser);

    const payload = true;
    res.status(200).send(payload);
  })
);

module.exports = router;
