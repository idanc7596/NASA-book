'use strict';
const bcrypt = require('bcrypt');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING,
      validate: {
        is: /^[a-zA-Z\s]+$/i,
        len: [3,32]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        is: /^[a-zA-Z\s]+$/i,
        len: [3,32]
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
        len: [0,32]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

  }, {
    sequelize,
    modelName: 'User',
  });

  //a trigger that encrypts the user's password before it is added to the database.
  User.beforeCreate(async function(user) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  }

  return User;
};