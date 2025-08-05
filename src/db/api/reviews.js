const db = require("../models");
const crypto = require("crypto");
const Sequelize = require("sequelize");
// const getUrl = require('./helpers/getUrl'); // Removed as it's not needed
const { handleError } = require("../../helpers");

const reviewsApi = {
  list: async (req, res) => {
    try {
      const { product_id, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (product_id) {
        where.product_id = product_id;
      }

      const { count, rows } = await db.reviews.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
        include: [
          {
            model: db.products,
            as: "product",
            attributes: ["id", "title"],
          },
        ],
      });

      res.json({
        rows,
        count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  listByProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Get reviews
      const { count, rows } = await db.reviews.findAndCountAll({
        where: { product_id: productId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      // Calculate statistics
      const allReviews = await db.reviews.findAll({
        where: { product_id: productId },
        attributes: ["rating"],
      });

      const totalReviews = allReviews.length;
      const averageRating =
        totalReviews > 0
          ? allReviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          : 0;

      const ratingCounts = {
        5: allReviews.filter((r) => r.rating === 5).length,
        4: allReviews.filter((r) => r.rating === 4).length,
        3: allReviews.filter((r) => r.rating === 3).length,
        2: allReviews.filter((r) => r.rating === 2).length,
        1: allReviews.filter((r) => r.rating === 1).length,
      };

      res.json({
        reviews: rows,
        count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        statistics: {
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(2)),
          ratingCounts,
        },
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  get: async (req, res) => {
    try {
      const { id } = req.params;
      const review = await db.reviews.findByPk(id, {
        include: [
          {
            model: db.products,
            as: "product",
            attributes: ["id", "title"],
          },
        ],
      });

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json(review);
    } catch (error) {
      handleError(res, error);
    }
  },

  create: async (req, res) => {
    try {
      const { product_id, rating, headline, comment, reviewer_name, images } =
        req.body;

      // Validate required fields
      if (!product_id || !rating || !headline || !comment) {
        return res.status(400).json({
          message:
            "Missing required fields: product_id, rating, headline, comment",
        });
      }

      // Validate rating range
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      // Check if product exists
      const product = await db.products.findByPk(product_id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const review = await db.reviews.create({
        product_id,
        rating,
        headline,
        comment,
        reviewer_name: reviewer_name || "Anonymous",
        images: images || [],
      });

      res.status(201).json(review);
    } catch (error) {
      handleError(res, error);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, headline, comment, reviewer_name, images } = req.body;

      const review = await db.reviews.findByPk(id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Validate rating range if provided
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      await review.update({
        rating: rating || review.rating,
        headline: headline || review.headline,
        comment: comment || review.comment,
        reviewer_name: reviewer_name || review.reviewer_name,
        images: images || review.images,
      });

      res.json(review);
    } catch (error) {
      handleError(res, error);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const review = await db.reviews.findByPk(id);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      await review.destroy();
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      handleError(res, error);
    }
  },
};

module.exports = reviewsApi;
