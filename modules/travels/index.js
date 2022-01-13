const toSql = require('../../utils/toSql');
const download = require('../../utils/download');
const { uploadDirForPermanentImages, dateToPath } = require('../../utils/pathBuilder');
const { UPLOAD_DISK } = require('../../constants');
const { v4 } = require('uuid');
const Travel = require('./models/Travel');

const { AlbumsCount, NotesCount, ReviewsCount, QuestionsCount } = require('./subqueries')

let limit = 50,
    offset = 0;

function run() {
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
      include: { all: true, nested: true },
      offset,
      limit,
    })
    .then(async travels => {
      if (travels.length === 0) {
        return
      }

      for await (let travel of travels) {
        travel = travel.get();

        await toSql({
          id: travel.id,
          user_id: travel.user_id,
          title: travel.title,
          text: travel.text,
          budget: travel.budget,
          notes_count: travel.notes_count,
          reviews_count: travel.reviews_count,
          albums_count: travel.albums_count,
          questions_count: travel.questions_count,
          date_start: travel.date_start,
          date_end: travel.date_end,
          created_at: travel.created_at,
          updated_at: travel.updated_at,
          deleted_at: travel.deleted_at,
          published_at: travel.published_at,
        }, 'travels')

        /*await toSql({
          key: `emitter${travel.user_id}travels${travel.id}`,
          event_id: 1,
          emitter_id: travel.user_id,
          recipient_id: travel.user_id,
          travel_id: travel.id,
          model_type: 'travels',
          model_id: travel.id,
          ip: 1,
          weight: 0.0120,
          created_at: travel.created_at,
        }, 'travels', 'activity')*/


        /*
         * Обложки путешествий.
         */
        /*const path = uploadDirForPermanentImages(travel.user_id);
        const fullPath = `users/${path}/travels/${dateToPath(travel.created_at)}`;
        const cover = travel.MediaBind
            ? travel.MediaBind.Medium
            : null;
        const filename = `cover-${travel.id}.jpg`;

        if (cover) {
          await toSql({
            user_id: travel.user_id,
            model_id: travel.id,
            disk: UPLOAD_DISK,
            path: fullPath + '/' + filename,
          }, 'travels', 'travels_images')

          await download('travels', cover, UPLOAD_DISK, fullPath, filename, 1024, 768);
        }*/
      }

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();
