const { DataTypes, Sequelize, sequelize } = require('../../../database');
const User = require('../../users/models/User');
const dateConverter = require('../../../utils/dateConverter');

const ChatMessageImage = sequelize.define('ChatMessageImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  message_id: {
    type: DataTypes.INTEGER,
  },
  disk: {
    type: DataTypes.STRING,
  },
  path: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'notes_chats_messages_images',
  timestamps: false,
  defaultScope: {
    where: {
      deleted_at: null,
    }
  },
});

ChatMessageImage.belongsTo(User, {
  foreignKey: 'user_id',
  sourceKey: 'id',
});

module.exports = ChatMessageImage;
