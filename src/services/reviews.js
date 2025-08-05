const db = require("../db/models");
const ReviewsDBApi = require("../db/api/reviews");

module.exports = class ReviewsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await ReviewsDBApi.create(data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let reviews = await ReviewsDBApi.findBy({ id }, { transaction });

      if (!reviews) {
        throw new ValidationError("reviewsNotFound");
      }

      await ReviewsDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (currentUser.role !== "admin") {
        throw new ValidationError("errors.forbidden.message");
      }

      await ReviewsDBApi.remove(id, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async findByProductId(productId) {
    try {
      const result = await ReviewsDBApi.findByProductId(productId);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
