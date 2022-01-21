const { SQL, Download } = require('../../classes');
const { UPLOAD_DISK } = require('../../constants');
const { Sequelize } = require('../../database');
const { uploadDirForPermanentImages, dateToPath } = require('../../utils/pathBuilder');

const {
  Travel,
  Company,
  Media,
  MediaBind
} = require('../../models');

const LikesParserPartial = require('../likes/likes-parser-partial');
const ShareParserPartial = require('../share/share-parser-partial');

let offset = 0
    limit = 100;

let newId = 0, coverId = 0;

async function run() {
  const companies = await Company.findAll();

  Travel
    .findAll({
      include: [
        {
          model: MediaBind,
          include: [
            { model: Media, required: false },
          ]
        },
      ],
      where: {
        user_id: companies.map(company => company.user_id),
      },
      offset,
      limit,
    })
    .then(async travels => {
      if (travels.length === 0) return;

      for (let travel of travels) {
        travel = travel.get();

        newId++;

        travel.id = newId;

        /*
          ЛАЙКИ.
         */
        const likes = await LikesParserPartial('posts', 'posts_likes', {
          likes_id: travel.id,
          module_type: 1,
        }, travel);

        /*
          ШАРА.
         */
        const share = await ShareParserPartial('posts', 'posts_share', {
          model_id:   travel.id,
          model_type: 'Modules\\Travels\\Entities\\Travel',
        }, travel);

        /*
          ОБЛОЖКИ ПУТЕШЕСТВИЙ.
         */
        const path = uploadDirForPermanentImages(travel.user_id);
        const outputPath = `users/${path}/posts/${dateToPath(travel.created_at)}`;
        const cover = travel.MediaBind
            ? travel.MediaBind.Medium
            : null;

        if (cover) {
          const filename = `travels-${cover.filename}`;

          await new SQL('trevio.posts_images', {
            user_id: travel.user_id,
            model_id: travel.id,
            disk: UPLOAD_DISK,
            path: outputPath + '/' + filename,
          })
              .setOutputFolder('posts')
              .setFilename('trevio.posts_images')
              .parse();

          coverId++;

          await new Download('posts', cover.filename, outputPath, filename)
              .setWidthHeight(1024, 768)
              .download();
        }

        const fields = {
          id: travel.id,
          chat_id: travel.id,
          user_id: travel.user_id,
          title: travel.title,
          text: `<p>${travel.short_text}</p>${travel.text}`,
          messages_count: travel.messages_count,
          likes_count: likes.length,
          share_count: share.length,
          created_at: travel.created_at,
          updated_at: travel.updated_at,
          deleted_at: travel.deleted_at,
          published_at: travel.published_at,
        };

        if (coverId > 0) {
          fields.cover_id = coverId;
        }

        await new SQL('posts', fields)
        .setOutputFolder('posts')
        .setFilename('trevio.posts')
        .parse();

        await new SQL('trevio.activity', {
          key: `emitter${travel.user_id}posts${travel.id}`,
          event_id: 1,
          emitter_id: travel.user_id,
          recipient_id: travel.user_id,
          travel_id: travel.id,
          model_type: 'posts',
          model_id: travel.id,
          weight: 0.0120,
          created_at: travel.created_at,
        })
        .setOutputFolder('posts')
        .setFilename('trevio.posts_activity')
        .parse();
      }

      offset += travels.length;

      setTimeout(() => run(), 1000);
    });
}

run();
