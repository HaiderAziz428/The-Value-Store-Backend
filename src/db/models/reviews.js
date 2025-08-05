const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const reviews = sequelize.define(
    'reviews',
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
        defaultValue: 'Anonymous',
      },
      images: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'reviews',
    },
  );

  reviews.associate = (db) => {
    // Associate with products
    reviews.belongsTo(db.products, {
      as: 'product',
      foreignKey: 'product_id',
      targetKey: 'id',
      constraints: false,
    });

    // Associate with users (optional)
    reviews.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    reviews.belongsTo(db.users, {
      as: 'createdBy',
    });

    reviews.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return reviews;
}; 