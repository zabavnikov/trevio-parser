const toSql = require('../../utils/toSql');
const download = require('../../utils/download');
const { uploadDirForPermanentImages, dateToPath } = require('../../utils/pathBuilder');
const Travel = require('./models/Travel');

let limit = 20, offset = 0;

function run() {
  Travel
    .findAll({
      include: [{ all: true, nested: true }],
      offset,
      limit,
    })
    .then(async travels => {
      if (travels.length === 0) {
        return
      }

      for await (let travel of travels) {
        travel = travel.get();

        const path = uploadDirForPermanentImages(travel.user_id);
        const cover = travel.MediaBind
            ? travel.MediaBind.Medium
            : null;

        await toSql({
          id: travel.id,
          user_id: travel.user_id,
          title: travel.title,
          text: travel.text,
          budget: travel.budget,
          date_start: travel.date_start,
          date_end: travel.date_end,
          is_draft: travel.status === 'draw',
          created_at: travel.created_at,
          updated_at: travel.updated_at,
          deleted_at: travel.deleted_at,
          published_at: travel.published_at,
        }, 'travels')

        await toSql({
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
        }, 'travels', 'activity')

        await toSql({
          user_id: travel.user_id,
          model_id: travel.id,
          disk: 'public',
          path: `users/${path}/travels/${dateToPath(travel.created_at)}`
        }, 'travels', 'travels_images')

        /*if (cover) {
          await download(cover, 'travels/images', path, 'cover.jpg', 1920, 1080);
        }*/
      }

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();
