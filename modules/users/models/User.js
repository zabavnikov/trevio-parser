const md5 = require('md5');

const { DataTypes, sequelize } = require('../../../database');

const Media = require('../../media/Media');

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
  defaultScope: {
    where: {
      confirmed: 1
    }
  },
});

User.belongsTo(Media, {
  foreignKey: 'avatar',
  sourceKey: 'id',
});

module.exports = User;