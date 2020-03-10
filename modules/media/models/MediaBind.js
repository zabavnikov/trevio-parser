const { DataTypes, sequelize } = require('../../../database');

const Media = require('./Media');

const MediaBind = sequelize.define('MediaBind', {
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
  tag: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'media_bind',
  timestamps: false,
});

MediaBind.belongsTo(Media, {foreignKey: 'media_id', sourceKey: 'id'});

module.exports = MediaBind;
