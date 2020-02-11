const { DataTypes, sequelize } = require('../../database');

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
}, {
  tableName: 'media_bind',
  timestamps: false,
});

MediaBind.hasOne(Media, {foreignKey: 'avatar', sourceKey: 'media_id'});

module.exports = MediaBind;