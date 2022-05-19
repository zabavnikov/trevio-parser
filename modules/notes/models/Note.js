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
  company_id: {
    type: DataTypes.INTEGER,
  },
  note_type_id: {
    type: DataTypes.INTEGER,
  },
  messages_count: {
    type: DataTypes.INTEGER,
    field: 'message_count',
  },
  type: {
    type: DataTypes.VIRTUAL,
    get() {
      const typeId    = parseInt(this.getDataValue('note_type_id'));
      const companyId = parseInt(this.getDataValue('company_id'));

      if (companyId > 0) {
        return 'posts';
      }

      if (typeId === 4) {
        return 'albums';
      } else if (typeId === 3 || typeId === 5) {
        return 'reviews';
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
    get() {
      let text = this.getDataValue('text');

      if (text) {
        text = text
          .replace(
            /src="\/imagecache\/(.*?)"/g,
            'src="https://trevio.ru/imagecache/$1"'
          ).replace(
            /<img(.*?)>/g,
            '<image$1></image>'
          ).replace(
            /<iframe.*?src="(.*?)"[^>]+><\/iframe>/g,
            '<provider src="$1"></provider>'
          )
          .replace('&nbsp;', '')
          .replace('undefined', '')
          .replace(/<p>\s<\/p>/g, '')
          .trim();

        const providers = text.match(/<provider.*?src="(.*?)"><\/provider>/g);

        if (providers) {
          const youtubeRegExp =
              /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

          providers.forEach(provider => {
            const item = /<provider.*?src="(.*?)"><\/provider>/.exec(provider);
            const videoId = youtubeRegExp.exec(item[1]);

            if (videoId) {
              text = text.replace(provider, `<provider data-id="${videoId[1]}" data-name="youtube"></provider>`)
            }
          });
        }

        return text;
      }

      return '';
    }
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
      isConfirmed: Sequelize.where(Sequelize.col('User.confirmed'), {
        [Sequelize.Op.eq]: 1
      }),
    },
    include: [
      { model: User }
    ]
  },
});

Note.belongsTo(User, {
  foreignKey: 'user_id',
});

Note.hasMany(MediaBind, {
  foreignKey: 'module_id',
  scope: {
    module_type_id: 2,
    tag: ['cover', 'gallery'],
  },
});

module.exports = Note;
