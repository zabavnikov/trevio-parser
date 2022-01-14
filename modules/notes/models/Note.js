const { DataTypes, Sequelize, sequelize } = require('../../../database');
const { dateFields } = require('../../../utils/modelFieldset');
const User = require('../../users/models/User');
const MediaBind = require('../../media/models/MediaBind');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  travel_id: {
    type: DataTypes.INTEGER,
  },
  note_type_id: {
    type: DataTypes.INTEGER,
  },
  type: {
    type: DataTypes.VIRTUAL,
    get() {
      const typeId = parseInt(this.getDataValue('note_type_id'));

      if (typeId === 4) {
        return 'albums';
      } else if (typeId === 3 || typeId === 5) {
        return 'reviews';
      } else if (typeId === 8) {
        return 'questions';
      } else {
        return 'notes';
      }
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    get() {
      const rating = parseInt(this.getDataValue('rating'));

      if (rating > 10 && rating < 20) {
        return 1;
      } else if (rating > 20 && rating < 30) {
        return 2;
      } else if (rating > 30 && rating < 40) {
        return 3;
      } else if (rating > 40 && rating < 50) {
        return 4;
      } else {
        return 5;
      }
    }
  },
  title: {
    type: DataTypes.STRING,
  },
  short_text: {
    type: DataTypes.STRING,
  },
  text: {
    type: DataTypes.TEXT,
    field: 'wysiwyg',
  },
  message_count: {
    type: DataTypes.INTEGER,
  },
  ...dateFields,
}, {
  tableName: 'notes',
  timestamps: false,
  defaultScope: {
    where: {
      status: 'published',
      deleted_at: null,
      user_confirmed: Sequelize.where(Sequelize.col('User.confirmed'), {
        [Sequelize.Op.eq]: 1
      }),
    },
  },
});

Note.belongsTo(User, {
  foreignKey: 'user_id',
});

Note.hasMany(MediaBind, {
  foreignKey: 'module_id',
  scope: {
    module_type_id: 2,
    tag: {
      [Sequelize.Op.in]: ['wysiwyg', 'cover']
    },
  },
});

module.exports = Note;
