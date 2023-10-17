'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comment.init({
    imageDate: {
      type: DataTypes.STRING,
      validate: {
        isDate: true,
      }
    },
    userID: {
      type: DataTypes.INTEGER,
    },
    username: {
      type: DataTypes.STRING,
    },
    text: {
      type: DataTypes.STRING,
      validate: {
        len: [1,128]
      }
    }
  }, {
    sequelize,
    modelName: 'Comment',
  });

  return Comment;
};