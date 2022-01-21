const { DataTypes, Sequelize, sequelize } = require('../../../database');
const { dateFields } = require('../../../utils/modelFieldset');
const User = require('../../users/models/User');
const MediaBind = require('../../media/models/MediaBind');

const Travel = sequelize.define('Travel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  company_id: {
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING,
  },
  text: {
    type: DataTypes.STRING,
    field: 'wysiwyg',
    get() {
      let text = this.getDataValue('text');

      if (text) {
        text = text
            .replace(
                /src="\/imagecache\/(.*?)"/g,
                'src="https://trevio.ru/imagecache/$1"'
            ).replace(
                /<img(.*?)>/g,
                '<ce-image$1></ce-image>'
            ).replace(
                /<iframe.*?src="(.*?)"[^>]+><\/iframe>/g,
                '<ce-embed src="$1"></ce-embed>'
            )
            .replace(/&nbsp;/g, '')
            .replace(/<p>\s<\/p>/g, '')
            .trim();

        const embeds = text.match(/<ce-embed.*?src="(.*?)"><\/ce-embed>/g);

        if (embeds) {
          const youtubeRegExp =
              /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

          embeds.forEach(embed => {
            const item = /<ce-embed.*?src="(.*?)"><\/ce-embed>/.exec(embed);
            const videoId = youtubeRegExp.exec(item[1]);

            if (videoId) {
              text = text.replace(embed, `<ce-embed video-id="${videoId[1]}" provider="youtube"></ce-embed>`)
            }
          });
        }

        return text;
      }

      return '';
    }
  },
  status: {
    type: DataTypes.STRING,
  },
  budget: {
    type: DataTypes.INTEGER,
  },
  date_start: {
    type: DataTypes.DATE,
  },
  date_end: {
    type: DataTypes.DATE,
  },
  type: {
    type: DataTypes.VIRTUAL,
    get() {
      return parseInt(this.getDataValue('company_id')) > 0
          ? 'posts'
          : 'travels';
    }
  },
  messages_count: {
    type: DataTypes.INTEGER,
    field: 'message_count',
  },
  ...dateFields,
}, {
  tableName: 'travels',
  timestamps: false,
  defaultScope: {
    where: {
      status: 'published',
      deleted_at: null,
      isConfirmed: Sequelize.where(Sequelize.col('User.confirmed'), {
        [Sequelize.Op.eq]: 1
      }),
    },
    include: [
      { model: User },
    ]
  },
});

Travel.belongsTo(User, {
  foreignKey: 'user_id',
});

Travel.hasOne(MediaBind, {
  foreignKey: 'module_id',
  scope: {
    module_type_id: 1,
    tag: 'cover',
  },
});

module.exports = Travel;
