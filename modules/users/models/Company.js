const { DataTypes, Sequelize, sequelize } = require('../../../database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'poi',
  timestamps: false,
  defaultScope: {
    where: {
      user_id: {
        [Sequelize.Op.gt]: 0
      }
    },
  },
});

module.exports = Company;
