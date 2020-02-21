const md5 = require('md5');

const { DataTypes, sequelize } = require('../../../database');

const MediaBind = require('../../media/MediaBind');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    field: 'nickname',
  },
  email: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.INTEGER,
    get() {
      const isExists = parseInt(this.getDataValue('avatar')) > 0;

      if (isExists > 0) {
        return [
          md5(this.getDataValue('id')).substr(0, 8).match(/[a-z0-9]{2}/g).join('/'),
          this.getDataValue('id'),
          'avatar.jpg'
        ].join('/');
      }

      return null;
    }
  },
  first_name: {
    type: DataTypes.STRING,
    get() {
      const value = this.getDataValue('first_name');

      if (value) {
        return value.substr(0, 25);
      }

      return null;
    }
  },
  last_name: {
    type: DataTypes.STRING,
    get() {
      const value = this.getDataValue('last_name');

      if (value) {
        return value.substr(0, 25);
      }

      return null;
    }
  },
  birthday: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.STRING,
    get() {
      const value = new Date(Date.parse(this.getDataValue('created_at'))).toLocaleString();
      return value === 'Invalid Date' ? null : value;
    }
  },
  updated_at: {
    type: DataTypes.STRING,
    get() {
      const value = new Date(Date.parse(this.getDataValue('updated_at'))).toLocaleString();
      return value === 'Invalid Date' ? null : value;
    }
  },
}, {
  tableName: 'users',
  timestamps: false,
});

User.belongsTo(MediaBind, {
  foreignKey: 'avatar',
  sourceKey: 'module_id',
});

module.exports = User;