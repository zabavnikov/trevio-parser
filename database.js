const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  DataTypes,
  sequelize: new Sequelize('123123', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
  }),
};