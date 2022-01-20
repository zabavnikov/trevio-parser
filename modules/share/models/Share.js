const { DataTypes, Sequelize, sequelize } = require('../../../database');
const User = require('../../users/models/User');
const dateConverter = require('../../../utils/dateConverter');

const Share = sequelize.define('Share', {
  user_id: {
    type: DataTypes.INTEGER,
  },
  model_type: {
    type: DataTypes.STRING,
    get() {
      return {
        'Modules\\Travels\\Entities\\Travel': 'travels',
        'Modules\\Notes\\Entities\\Notes':    'notes',
      }[this.getDataValue('model_type')];
    }
  },
  model_id: {
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
  tableName: 'recommend',
  timestamps: false,
  defaultScope: {
    where: {
      user_confirmed: Sequelize.where(Sequelize.col('User.confirmed'), {
        [Sequelize.Op.eq]: 1
      }),
    },
    include: [
      {model: User}
    ]
  },
});

Share.removeAttribute('id');

Share.belongsTo(User, {
  foreignKey: 'user_id',
});

module.exports = Share;
