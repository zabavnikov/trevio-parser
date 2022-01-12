const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  DataTypes,
  Sequelize,
  sequelize: new Sequelize('trevio_old', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
  }),
};