const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  DataTypes,
  Sequelize,
  sequelize:  new Sequelize('trevio_old', 'root', '1234567890', {
    host:     'localhost',
    dialect:  'mysql',
  }),
};