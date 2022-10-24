const { SQL, Download } = require('../../classes');
const { rndString } = require('../../utils');
const { UPLOAD_DISK, TRAVEL_IMAGE_SIZE} = require('../../constants');
const { Sequelize } = require('../../database');
const { uploadDirForPermanentImages, dateToPath } = require('../../utils/pathBuilder');

const {
  Travel,
  Company,
  Media,
  MediaBind
} = require('../../models');

const {
  AlbumsCount,
  NotesCount,
  ReviewsCount,
  QuestionsCount
} = require('./subqueries');

const LikesParserPartial = require('../likes/likes-parser-partial');
const ShareParserPartial = require('../share/share-parser-partial');
const SubscriptionTravel = require('../subscriptions/models/SubscriptionTravel');

let offset = 0
    limit = 100;

async function run() {
  const companies = await Company.findAll();

  Travel
    .findAll({
      attributes: {
        include: [
          AlbumsCount,
          NotesCount,
          ReviewsCount,
          QuestionsCount
        ]
      },
      include: [
        {
          model: MediaBind,
          include: [
            { model: Media, required: false },
          ]
        },
      ],
      where: {
        user_id: {
          [Sequelize.Op.notIn]: companies.map(company => company.user_id)
        },
      },
      offset,
      limit,
    })
    .then(async travels => {
      if (travels.length === 0) return;

      for (let travel of travels) {
        travel = travel.get();

        /*
          ПОДПИСКИ НА ПУТЕШЕСТВИЯ.
         */
        await SubscriptionTravel
          .count({
            where: {
              module_id: travel.id,
            }
          })
          .then((count) => travel['subscribers_count'] = count);

        /*
          ЛАЙКИ.
         */
        const likes = await LikesParserPartial('travels', 'travels_likes', {
          likes_id: travel.id,
          module_type: 1,
        }, travel);

        /*
          ШАРА.
         */
        const share = await ShareParserPartial('travels', 'travels_share', {
          model_id:   travel.id,
          model_type: 'Modules\\Travels\\Entities\\Travel',
        }, travel);


        const travelFields = {
          id: travel.id,
          user_id: travel.user_id,
          title: travel.title,
          text: travel.text,
          budget: travel.budget,
          notes_count: travel.notes_count,
          reviews_count: travel.reviews_count,
          albums_count: travel.albums_count,
          questions_count: travel.questions_count,
          likes_count: likes.length,
          share_count: share.length,
          date_start: travel.date_start,
          date_end: travel.date_end,
          published_at: travel.published_at,
          created_at: travel.created_at,
          updated_at: travel.updated_at,
          deleted_at: travel.deleted_at,
        };

        if (travelFields.budget > 0) {
          travelFields.currency_id = 1;
        }

        await new SQL('travels', travelFields)
        .setOutputFolder('travels')
        .setAllowedTags([])
        .setFilename('trevio.travels')
        .parse();

        await new SQL('trevio.activity', {
          key: `emitter${travel.user_id}travels${travel.id}`,
          type_id: 1,
          emitter_id: travel.user_id,
          recipient_id: travel.user_id,
          travel_id: travel.id,
          model_type: 'travels',
          model_id: travel.id,
          created_at: travel.created_at,
        })
        .setOutputFolder('travels')
        .setFilename('trevio.travels_activity')
        .parse();

        /*
          ОБЛОЖКИ ПУТЕШЕСТВИЙ.
         */
        const cover = travel.MediaBind
            ? travel.MediaBind.Medium
            : null;

        if (cover) {
          const path = uploadDirForPermanentImages(travel.user_id);
          const outputPath = `${path}/${dateToPath(travel.created_at)}`;
          const outputFileName = rndString();

          await new SQL('trevio.travels_images', {
            user_id: travel.user_id,
            model_id: travel.id,
            disk: UPLOAD_DISK,
            path: outputPath + '/' + outputFileName,
          })
            .setOutputFolder('travels')
            .setFilename('trevio.travels_images')
            .parse();

          await new Download('travels', cover.filename, outputPath, outputFileName)
              .setWidthHeight(TRAVEL_IMAGE_SIZE[0], TRAVEL_IMAGE_SIZE[1])
              .download();
        }
      }

      offset += travels.length;

      setTimeout(() => run(), 1000);
    });
}

run();
