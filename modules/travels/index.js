const argv = require('minimist')(process.argv.slice(2));

const { SQL, Download } = require('../../classes');
const toSql = require('../../utils/toSql');
const { uploadDirForPermanentImages, dateToPath } = require('../../utils/pathBuilder');
const { UPLOAD_DISK } = require('../../constants');
const { v4 } = require('uuid');

const { Travel, User, Like, MediaBind } = require('../../models');

const { AlbumsCount, NotesCount, ReviewsCount, QuestionsCount } = require('./subqueries');

const LikesParserPartial = require('../likes/likes-parser-partial');
const ShareParserPartial = require('../share/share-parser-partial');

let limit = 100,
    offset = 0;

function run() {
  Travel
    .findAll({
      order: [
        ['id', 'ASC'],
      ],
      attributes: {
        include: [
          AlbumsCount,
          NotesCount,
          ReviewsCount,
          QuestionsCount
        ]
      },
      include: { all: true, nested: true },
      offset,
      limit,
    })
    .then(async travels => {
      if (travels.length === 0) {
        return
      }

      for (let travel of travels) {
        travel = travel.get();

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

        await new SQL('travels', {
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
          created_at: travel.created_at,
          updated_at: travel.updated_at,
          deleted_at: travel.deleted_at,
          published_at: travel.published_at,
        })
        .parse();

        await new SQL('trevio.activity', {
          id: `emitter${travel.user_id}travels${travel.id}`,
          event_id: 1,
          emitter_id: travel.user_id,
          recipient_id: travel.user_id,
          travel_id: travel.id,
          model_type: 'travels',
          model_id: travel.id,
          weight: 0.0120,
          created_at: travel.created_at,
        })
        .setOutputFolder('travels')
        .setFilename('trevio.travels_activity')
        .parse();

        /*/*
         * Обложки путешествий.
         */
        /*const path = uploadDirForPermanentImages(travel.user_id);
        const outputPath = `users/${path}/travels/${dateToPath(travel.created_at)}`;
        const cover = travel.MediaBind
            ? travel.MediaBind.Medium
            : null;
        const filename = `cover-${travel.id}.jpg`;

        if (cover) {
          await toSql({
            user_id: travel.user_id,
            model_id: travel.id,
            disk: UPLOAD_DISK,
            path: outputPath + '/' + filename,
          }, 'travels', 'travels_images')

          await new Download('travels', cover.filename, outputPath, filename)
              .setWidthHeight(1024, 768)
              .download();
        }*/
      }

      offset += travels.length;

      setTimeout(() => run(), 1000);
    });
}

run();
