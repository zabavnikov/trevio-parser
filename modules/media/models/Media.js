const { DataTypes, sequelize } = require('../../../database');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  filename: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.DATE,
  },
  path: {
    type: DataTypes.VIRTUAL,
    get() {
      const filename = this.getDataValue('filename');

      // Путь к оригинальному изображению.
      return `/storage/media/${filename.substr(0, 1)}/${filename.substr(1, 2)}/${filename.substr(3, 2)}/${filename}`;
    }
  },
}, {
  tableName: 'media',
  timestamps: false,
});

module.exports = Media;
