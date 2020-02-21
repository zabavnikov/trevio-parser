const sqlMigrator = require('../../utils/sql-migrator');
const User = require('./models/User');

let limit = 500, offset = 0;

function run() {
  User
    .findAll({
      order: [
        ['id', 'ASC'],
      ],
      offset,
      limit,
    })
    .then(users => {
      sqlMigrator(users, 'users');

      offset += limit;

      setTimeout(() => run(), 1000);
    });
}

run();