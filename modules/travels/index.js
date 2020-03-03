const toSql = require('../../utils/toSql');
const Travel = require('./models/Travel');

let limit = 300, offset = 0;

function run() {
  Travel
    .findAll({
      include: [{ all: true, nested: true }],
      offset,
      limit,
    })
    .then(travels => {
      travels.forEach(travel => toSql({
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
      }, 'travels'));

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();
