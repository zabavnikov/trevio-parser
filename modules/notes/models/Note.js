const { DataTypes, Sequelize, sequelize } = require('../../../database');
const { dateFields } = require('../../../utils/modelFieldset');
const User = require('../../users/models/User');

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

/*
Note.hasOne(MediaBind, {
  foreignKey: 'module_id',
  scope: {
    module_type_id: 1,
    tag: 'cover',
  },
});*/

module.exports = Note;
