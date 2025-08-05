const config = require("../../config");
const providers = config.providers;
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const moment = require("moment");

module.exports = function (sequelize, DataTypes) {
  const reviews = sequelize.define(
    "reviews",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      headline: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      reviewer_name: {
        type: DataTypes.STRING(100),
        defaultValue: "Anonymous",
      },
      images: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  reviews.associate = (db) => {
    // Associate with products (using product_id as foreign key)
    reviews.belongsTo(db.products, {
      as: "product",
      foreignKey: "product_id",
      targetKey: "id",
      constraints: false,
    });

    reviews.belongsTo(db.users, {
      as: "createdBy",
    });

    reviews.belongsTo(db.users, {
      as: "updatedBy",
    });
  };

  return reviews;
};
