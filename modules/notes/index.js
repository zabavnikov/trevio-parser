const toSql = require('../../utils/toSql');
const download = require('../../utils/download');
const { uploadDirForPermanentImages, dateToPath } = require('../../utils/pathBuilder');
const { UPLOAD_DISK } = require('../../constants');
const Note = require('./models/Note');
const SQL = require('../../classes/SQL');
const { v4 } = require('uuid');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let limit = 50,
    offset = 0,
    moduleName = 'notes';

function run() {
  Note
      .findAll({
        include: { all: true, nested: true },
        offset,
        limit,
      })
      .then(async notes => {
        if (notes.length === 0) {
          return
        }

        for await (let note of notes) {
          note = note.get();

          const dom = new JSDOM(note.text);
          const img = dom.window.document.querySelectorAll("img");

          img.forEach(i => {
            i.tagName = 'ce-image'
          })

          console.log(dom.serialize())

          return;

          await new SQL('notes', {
            id: note.id,
            user_id: note.user_id,
            travel_id: note.travel_id,
            title: note.title,
            text: `<p>${note.short_text}</p>${note.text}`,
            created_at: note.created_at,
            updated_at: note.updated_at,
            deleted_at: note.deleted_at,
            published_at: note.published_at,
          })
          .setHtmlFields(['text'])
          .parse()

          /*await toSql({
            id: note.id,
            user_id: note.user_id,
            travel_id: note.travel_id,
            title: note.title,
            text: `<p>${note.short_text}</p>${note.text}`,
            created_at: note.created_at,
            updated_at: note.updated_at,
            deleted_at: note.deleted_at,
            published_at: note.published_at,
          }, moduleName, ['text'])*/

          /*await toSql({
            key: `emitter${note.user_id}${moduleName}${note.id}`,
            event_id: 1,
            emitter_id: note.user_id,
            recipient_id: note.user_id,
            travel_id: note.id,
            model_type: moduleName,
            model_id: note.id,
            ip: 1,
            weight: 0.0120,
            created_at: note.created_at,
          }, moduleName, 'activity')*/


          /*
           * Обложки путешествий.
           */
          /*const path = uploadDirForPermanentImages(note.user_id);
          const fullPath = `users/${path}/travels/${dateToPath(note.created_at)}`;
          const cover = note.MediaBind
              ? note.MediaBind.Medium
              : null;
          const filename = `cover-${note.id}.jpg`;

          if (cover) {
            await toSql({
              user_id: note.user_id,
              model_id: note.id,
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
