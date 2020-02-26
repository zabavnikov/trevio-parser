const sqlMigrator = require('../../utils/sql-migrator');
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
      sqlMigrator(travels, 'travels');

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();
