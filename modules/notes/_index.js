const Note = require('./Note');
const Parser = require('../../Parser');
const settings = require('../../settings');
const forEach = require('lodash/forEach');
const fs = require('fs');

const outputNotes = [], outputImages = [], schema = {
  user_id: 'owner_id',
  travel_id: 'travel_id',
  company_id: 'company_id',
  title: 'title',
  short_text: 'short_text',
  wysiwyg: 'text',
  message_count: 'comments_count',
};

let limit = 1, offset = 0;

function notes() {
  if (offset >= 1000) {
    fs.writeFile(settings.paths.json + '/notes/notes.json', JSON.stringify(outputNotes), function (err) {
      if (err) return console.log(err);
    });

    fs.writeFile(settings.paths.json + '/notes/images.json', JSON.stringify(outputImages), function (err) {
      if (err) return console.log(err);
    });

    return;
  }

  Note
    .findAll({offset, limit})
    .then(items => {
      const insert = {};

      forEach(items, item => {
        const parser = new Parser(item, 'notes');

        item = parser.getModel();

        forEach(parser.getImages(), image => outputImages.push(image));

        forEach(schema, (newFieldName, oldFieldName) => {
          insert[newFieldName] = item[oldFieldName];
        });
      });

      outputNotes.push(insert);

      offset += limit;

      setTimeout(() => notes(), 1000);
    });
}

notes();
