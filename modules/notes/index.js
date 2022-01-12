const fs = require('fs');
const Note = require('./Note');
const Parser = require('../../Parser');
const settings = require('../../settings');
const {normalizeData} = require('../../helpers');
const forEach = require('lodash/forEach');

const outputImages = [], schema = {
  user_id: 'owner_id',
  travel_id: 'travel_id',
  note_type_id: 'category_id',
  company_id: 'company_id',
  title: 'title',
  short_text: 'short_text',
  wysiwyg: 'text',
  message_count: 'comments_count',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

let limit = 1, offset = 0;

function notes() {
  if (offset >= 5) {
    return;
  }

  Note
    .findAll({offset, limit})
    .then(items => {
      forEach(items, item => {
        const parser = new Parser(item, 'notes');

        /*
          Вернет item с обновленныйм полем wysiwyg.
         */
        item = parser.getModel();

        /*
          Заполняем новые поля данными из старых полей.
          normalizeData вернет набор полей уже подготовленных для вставки.
         */
        fs.appendFile(
          settings.paths.sql + '/notes/notes.sql',
          `INSERT INTO notes (${Object.values(schema).join(', ')}) VALUES (${normalizeData(item, schema).join(', ')});\r\n`,
          function (error) {
            if (error) return console.log(error);
          });

        /*
          Генерируем SQL файл для изображений.
         */
        forEach(parser.getImages(), image => {
          fs.appendFile(
            settings.paths.sql + '/notes/images.sql',
            `INSERT INTO notes_images (${Object.keys(image).join(', ')}) VALUES (${Object.values(image).join(', ')});\r\n`,
            function (error) {
              if (error) return console.log(error);
            });
        });
      });

      offset += limit;

      setTimeout(() => notes(), 1000);
    });
}

notes();
