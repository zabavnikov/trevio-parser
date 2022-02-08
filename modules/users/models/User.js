const moment = require('moment');
const { DataTypes, sequelize } = require('../../../database');
const { timestamps } = require('../../../utils');
const Media = require('../../media/models/Media');
const Company = require('./Company');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    field: 'nickname'
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
  },
  last_name: {
    type: DataTypes.STRING,
  },
  birthday: {
    type: DataTypes.STRING,
  },
  gender: {
    type: DataTypes.STRING,
    field: 'sex',
  },
  confirmed: {
    type: DataTypes.INTEGER,
  },
  last_activity_at: {
    type: DataTypes.DATE,
    field: 'last_activity',
    get() {
      const date = this.getDataValue('last_activity');

      return date
          ? moment.utc(date).format('YYYY-MM-DD HH:mm:ss')
          : null;
    }
  },
  ...timestamps,
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

User.hasOne(Company, {
  foreignKey: 'user_id',
});

module.exports = User;
