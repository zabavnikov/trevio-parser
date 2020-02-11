const md5 = require('md5');

const { DataTypes, sequelize } = require('../../../database');

const Media = require('../../media/Media');
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
          md5(this.getDataValue('id')).substr(0, 6).match(/[a-z0-9]{2}/g).join('/'),
          this.getDataValue('id'),
          'avatar.jpg'
        ].join('/');
      }

      return null;
    }
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
  created_at: {
    type: DataTypes.STRING,
    get() {
      return `"${new Date(Date.parse(this.getDataValue('created_at'))).toLocaleString()}"`;
    }
  },
  updated_at: {
    type: DataTypes.STRING,
    get() {
      return `"${new Date(Date.parse(this.getDataValue('updated_at'))).toLocaleString()}"`;
    }
  },
}, {
  tableName: 'users',
  timestamps: false,
});

/*User.hasOne(MediaBind, {foreignKey: 'avatar', sourceKey: 'media_id'});
User.hasOne(Media, {foreignKey: 'id', sourceKey: 'user_id'});*/

module.exports = User;