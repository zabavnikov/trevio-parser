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
  tableName: 'poi_owners',
  timestamps: false,
});

module.exports = Company;
