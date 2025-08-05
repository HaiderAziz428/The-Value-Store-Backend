const db = require("../models");
const FileDBApi = require("./file");
const crypto = require("crypto");
const Utils = require("../utils");

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class ReviewsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const reviews = await db.reviews.create(
      {
        id: data.id || undefined,
        product_id: data.product_id || null,
        rating: data.rating || null,
        headline: data.headline || null,
        comment: data.comment || null,
        reviewer_name: data.reviewer_name || "Anonymous",
        images: data.images || [],
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction }
    );

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.reviews.getTableName(),
        belongsToColumn: "images",
        belongsToId: reviews.id,
      },
      data.images,
      options
    );

    return reviews;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const reviews = await db.reviews.findByPk(id, {
      transaction,
    });

    await reviews.update(
      {
        product_id: data.product_id || null,
        rating: data.rating || null,
        headline: data.headline || null,
        comment: data.comment || null,
        reviewer_name: data.reviewer_name || "Anonymous",
        images: data.images || [],
        updatedById: currentUser.id,
      },
      { transaction }
    );

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.reviews.getTableName(),
        belongsToColumn: "images",
        belongsToId: reviews.id,
      },
      data.images,
      options
    );

    return reviews;
  }

  static async remove(id, options) {
    const transaction = (options && options.transaction) || undefined;

    const reviews = await db.reviews.findByPk(id, {
      transaction,
    });

    if (!reviews) {
      throw new Error("Review not found");
    }

    await reviews.destroy({ transaction });

    return reviews;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const reviews = await db.reviews.findOne({ where }, { transaction });

    if (!reviews) {
      return reviews;
    }

    const output = reviews.get({ plain: true });

    output.images = await reviews.getImages({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    var limit = 0;
    var offset = 0;
    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.products,
        as: "product",
      },
      {
        model: db.file,
        as: "images",
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ["id"]: Utils.uuid(filter.id),
        };
      }

      if (filter.product_id) {
        where = {
          ...where,
          ["product_id"]: filter.product_id,
        };
      }

      if (filter.rating) {
        where = {
          ...where,
          ["rating"]: filter.rating,
        };
      }

      if (filter.headline) {
        where = {
          ...where,
          [Op.and]: Utils.ilike("reviews", "headline", filter.headline),
        };
      }

      if (filter.comment) {
        where = {
          ...where,
          [Op.and]: Utils.ilike("reviews", "comment", filter.comment),
        };
      }

      if (filter.reviewer_name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            "reviews",
            "reviewer_name",
            filter.reviewer_name
          ),
        };
      }

      if (filter.ratingRange) {
        const [start, end] = filter.ratingRange;

        if (start !== undefined && start !== null && start !== "") {
          where = {
            ...where,
            rating: {
              ...where.rating,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== "") {
          where = {
            ...where,
            rating: {
              ...where.rating,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== "") {
          where = {
            ...where,
            ["createdAt"]: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== "") {
          where = {
            ...where,
            ["createdAt"]: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }
    }

    let { rows, count } = await db.reviews.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: orderBy ? [orderBy.split("_")] : [["createdAt", "DESC"]],
      transaction,
    });

    return { rows, count };
  }

  static async findByProductId(productId, options) {
    const transaction = (options && options.transaction) || undefined;

    let where = {
      product_id: productId,
    };

    let include = [
      {
        model: db.file,
        as: "images",
      },
    ];

    let { rows, count } = await db.reviews.findAndCountAll({
      where,
      include,
      order: [["createdAt", "DESC"]],
      transaction,
    });

    return { rows, count };
  }
};
