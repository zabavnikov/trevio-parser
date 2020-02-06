const { DataTypes, sequelize } = require('../../database');

module.exports = sequelize.define('Media', {
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
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },

  path: {
    type: DataTypes.VIRTUAL,
    get() {
      const filename = this.get('filename');

      /*
        Путь к оригинальному изображению.
       */
      return `/storage/media/${filename.substr(0, 1)}/${filename.substr(1, 2)}/${filename.substr(3, 2)}/${filename}`;
    }
  },
}, {
  tableName: 'media',
  timestamps: false,
});