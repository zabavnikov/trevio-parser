const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  DataTypes,
  Sequelize,
  sequelize: new Sequelize('123123', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
  }),
};