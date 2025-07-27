const db = require("../models");
const FileDBApi = require("./file");
const crypto = require("crypto");
const Utils = require("../utils");

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class ProductsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const products = await db.products.create(
      {
        id: data.id || undefined,
        title: data.title || null,
        price: data.price || null,
        discount: data.discount || null,
        description: data.description || null,
        rating: data.rating || null,
        status: data.status || null,
        meta_description: data.meta_description || null,
        keywords: data.keywords || null,
        meta_author: data.meta_author || null,
        meta_og_title: data.meta_og_title || null,
        meta_og_url: data.meta_og_url || null,
        meta_og_image: data.meta_og_image || null,
        meta_fb_id: data.meta_fb_id || null,
        meta_og_sitename: data.meta_og_sitename || null,
        post_twitter: data.post_twitter || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction }
    );

    await products.setCategories(data.categories || [], {
      transaction,
    });

    await products.setMore_products(data.more_products || [], {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.products.getTableName(),
        belongsToColumn: "image",
        belongsToId: products.id,
      },
      data.image,
      options
    );

    // Handle video files
    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.products.getTableName(),
        belongsToColumn: "video",
        belongsToId: products.id,
      },
      data.video,
      options
    );

    return products;
  }

  static async update(id, data, options) {
    console.log(data);
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const products = await db.products.findByPk(id, {
      transaction,
    });

    await products.update(
      {
        title: data.title || null,
        price: data.price || null,
        discount: data.discount || null,
        description: data.description || null,
        rating: data.rating || null,
        status: data.status || null,
        meta_description: data.meta_description || null,
        keywords: data.keywords || null,
        meta_author: data.meta_author || null,
        meta_og_title: data.meta_og_title || null,
        meta_og_url: data.meta_og_url || null,
        meta_og_image: data.meta_og_image || null,
        meta_fb_id: data.meta_fb_id || null,
        meta_og_sitename: data.meta_og_sitename || null,
        post_twitter: data.post_twitter || null,
        updatedById: currentUser.id,
      },
      { transaction }
    );

    await products.setCategories(data.categories || [], {
      transaction,
    });

    await products.setMore_products(data.more_products || [], {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.products.getTableName(),
        belongsToColumn: "image",
        belongsToId: products.id,
      },
      data.image,
      options
    );

    // Handle video files
    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.products.getTableName(),
        belongsToColumn: "video",
        belongsToId: products.id,
      },
      data.video,
      options
    );

    return products;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const products = await db.products.findByPk(id, options);

    await products.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      }
    );

    await products.destroy({
      transaction,
    });

    return products;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const products = await db.products.findOne({
      where,
      transaction,
      // Add query optimization
      attributes: [
        "id",
        "title",
        "price",
        "discount",
        "description",
        "rating",
        "status",
        "meta_description",
        "keywords",
        "meta_author",
        "meta_og_title",
        "meta_og_url",
        "meta_og_image",
        "meta_fb_id",
        "meta_og_sitename",
        "post_twitter",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!products) {
      return products;
    }

    const output = products.get({ plain: true });

    // Optimize file loading with specific attributes
    output.image = await products.getImage({
      transaction,
      attributes: ["id", "name", "publicUrl", "privateUrl"],
    });

    // Add this to include video files in the output
    output.video = await products.getVideo({
      transaction,
      attributes: ["id", "name", "publicUrl", "privateUrl"],
    });

    output.categories = await products.getCategories({
      transaction,
      attributes: ["id", "name", "description"],
    });

    output.more_products = await products.getMore_products({
      transaction,
      attributes: ["id", "title", "price"],
    });

    return output;
  }

  static async findAll(filter, options) {
    var limit = 0;
    var offset = 0;
    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};

    // Optimize includes to only fetch necessary data
    let include = [
      {
        model: db.categories,
        as: "categories",
        through: filter.categories
          ? {
              where: {
                [Op.or]: filter.categories.split("|").map((item) => {
                  return { ["categoryId"]: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.categories ? true : null,
        attributes: ["id", "name", "description"], // Only fetch needed attributes
      },

      {
        model: db.products,
        as: "more_products",
        through: filter.more_products
          ? {
              where: {
                [Op.or]: filter.more_products.split("|").map((item) => {
                  return { ["productId"]: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.more_products ? true : null,
        attributes: ["id", "title", "price"], // Only fetch needed attributes
      },

      {
        model: db.file,
        as: "image",
        attributes: ["id", "name", "publicUrl", "privateUrl"], // Only fetch needed attributes
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ["id"]: Utils.uuid(filter.id),
        };
      }

      if (filter.title) {
        where = {
          ...where,
          [Op.and]: Utils.ilike("products", "title", filter.title),
        };
      }

      if (filter.description) {
        where = {
          ...where,
          [Op.and]: Utils.ilike("products", "description", filter.description),
        };
      }

      if (filter.priceRange) {
        const [start, end] = filter.priceRange;

        if (start !== undefined && start !== null && start !== "") {
          where = {
            ...where,
            price: {
              ...where.price,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== "") {
          where = {
            ...where,
            price: {
              ...where.price,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.discountRange) {
        const [start, end] = filter.discountRange;

        if (start !== undefined && start !== null && start !== "") {
          where = {
            ...where,
            discount: {
              ...where.discount,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== "") {
          where = {
            ...where,
            discount: {
              ...where.discount,
              [Op.lte]: end,
            },
          };
        }
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

      if (
        filter.active === true ||
        filter.active === "true" ||
        filter.active === false ||
        filter.active === "false"
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === "true",
        };
      }

      if (filter.status) {
        where = {
          ...where,
          status: filter.status,
        };
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

    // Add pagination and limit for better performance
    if (filter && filter.limit) {
      limit = Number(filter.limit);
    } else {
      limit = 50; // Default limit to prevent large queries
    }

    if (filter && filter.offset) {
      offset = Number(filter.offset);
    }

    let { rows, count } = await db.products.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : 50, // Default limit
      offset: offset ? Number(offset) : 0,
      order: orderBy ? [orderBy.split("_")] : [["createdAt", "DESC"]],
      transaction,
      // Add query optimization
      attributes: [
        "id",
        "title",
        "price",
        "discount",
        "description",
        "rating",
        "status",
        "meta_description",
        "keywords",
        "meta_author",
        "meta_og_title",
        "meta_og_url",
        "meta_og_image",
        "meta_fb_id",
        "meta_og_sitename",
        "post_twitter",
        "createdAt",
        "updatedAt",
      ],
      // Add query hints for better performance
      subQuery: false,
    });

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ["id"]: Utils.uuid(query) },
          Utils.ilike("products", "title", query),
        ],
      };
    }

    const records = await db.products.findAll({
      attributes: ["id", "title"],
      where,
      limit: limit ? Number(limit) : 10, // Limit autocomplete results
      orderBy: [["title", "ASC"]],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.title,
    }));
  }
};
