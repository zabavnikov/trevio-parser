const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  DataTypes,
  Sequelize,
  sequelize: new Sequelize('trevio', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
  }),
};