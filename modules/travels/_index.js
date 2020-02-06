const Travel = require('./Travel');

Travel.findByPk(123)
  .then(r => {
    console.log(r)
  });

/*
const { QueryTypes, sequelize } = require('../database');

let limit = 100, offset = 0;

async function users() {
  if (offset >= 200) {
    return;
  }

  const result = await sequelize.query(
    `
      SELECT * FROM users LIMIT :limit OFFSET :offset
    `,
    {
      replacements: { limit, offset },
      type: QueryTypes.SELECT,
    }
  );

  offset += limit;

  users();

  console.log(offset);
}

users();*/
