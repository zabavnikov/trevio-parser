const { DataTypes, Sequelize, sequelize } = require('../../../database');
const User = require('../../users/models/User');
const dateConverter = require('../../../utils/dateConverter');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  module_type: {
    type: DataTypes.INTEGER,
  },
  likes_id: {
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
}, {
  tableName: 'likes',
  timestamps: false,
  defaultScope: {
    where: {
      deleted_at: null,
      user_confirmed: Sequelize.where(Sequelize.col('User.confirmed'), {
        [Sequelize.Op.eq]: 1
      }),
    },
    include: [
      {model: User}
    ]
  },
});

Like.belongsTo(User, {
  foreignKey: 'user_id',
});

module.exports = Like;
