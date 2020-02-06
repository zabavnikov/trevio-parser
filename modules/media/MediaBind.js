const { DataTypes, sequelize } = require('../../database');

module.exports = sequelize.define('MediaBind', {
  media_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  module_id: {
    type: DataTypes.INTEGER,
  },
  module_type_id: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'media_bind',
  timestamps: false,
});