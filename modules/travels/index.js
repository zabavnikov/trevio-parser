const toSql = require('../../utils/toSql');
const download = require('../../utils/download');
const { uploadDirForPermanentImages } = require('../../utils/pathBuilder');
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
      for await (let travel of travels) {
        travel = travel.get();

        //const path = uploadDirForPermanentImages(travel.id);
        //const cover = travel.MediaBind ? travel.MediaBind.Medium : null;

        await toSql({
          id: travel.id,
          owner_id: travel.owner_id,
          title: travel.title,
          text: travel.text,
          budget: travel.budget,
          date_start: travel.date_start,
          date_end: travel.date_end,
          created_at: travel.created_at,
          updated_at: travel.updated_at,
          published_at: travel.published_at,
        }, 'travels')

        await toSql({
          key: `emitter${travel.owner_id}travels${travel.id}`,
          event_id: 1,
          emitter_id: travel.owner_id,
          recipient_id: travel.owner_id,
          travel_id: travel.id,
          model_type: 'travels',
          model_id: travel.id,
          weight: 0.0120,
          created_at: travel.created_at,
        }, 'travels-activity')

        //if (cover) {
          //await download(cover, 'travels/images', path, travel.id + '_cover.jpg', 1920, 1080);
        //}
      }

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();
