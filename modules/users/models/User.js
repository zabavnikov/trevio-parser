const md5 = require('md5');
const { DataTypes, sequelize } = require('../../../database');
const Media = require('../../media/Media');
const dateConverter = require('../../../utils/dateConverter');

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
    get() {
      const value = this.getDataValue('description');

      if (value) {
        return value.substr(0, 1000);
      }

      return null;
    }
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
  confirmed: {
    type: DataTypes.INTEGER,
  },
  created_at: {
    type: DataTypes.DATE,
    get() {
      const date = this.getDataValue('created_at');

      if (date) {
        // Example: 2017-11-04 22:08:32
        return dateConverter(date);
      }

      return null;
    }
  },
  updated_at: {
    type: DataTypes.DATE,
    get() {
      const date = this.getDataValue('updated_at');

      if (date) {
        // Example: 2017-11-04 22:08:32
        return dateConverter(date);
      }

      return null;
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
