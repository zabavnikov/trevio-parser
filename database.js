const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  DataTypes,
  Sequelize,
  sequelize: new Sequelize('trevio-old', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
  }),
};