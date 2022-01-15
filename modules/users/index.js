const download = require('../../utils/download');
const toSql = require('../../utils/toSql');
const { uploadDirForPermanentImages } = require('../../utils/pathBuilder');
const User = require('./models/User');
const { Op } = require('sequelize')
const md5 = require('md5');
const { UPLOAD_DISK } = require('../../constants');

let limit = 400, offset = 0;
function run() {
  User
    .findAll({
      include: [{ all: true, nested: true }],
      order: [
        ['id', 'ASC'],
      ],
      offset,
      limit,
    })
    .then(async users => {
      if (users.length === 0) {
        return;
      }

      for await (let user of users) {
        user = user.get();

        const path = uploadDirForPermanentImages(user.id);
        const hasAvatar = user.avatar > 0;

        const insert = {
          id: user.id,
          name: user.username,
          email: user.email,
          password: user.password,
          description: user.description,
          birthday: user.birthday,
          gender: user.sex,
          email_verified_at: user.created_at,
          last_activity_at: user.last_activity,
          created_at: user.created_at,
          updated_at: user.updated_at,
        }

        // Парсим аватарку если есть.
        if (hasAvatar) {
          insert.avatar = `/users/${path}/avatar.jpg`;
          // await download('users', user.Medium, UPLOAD_DISK, path, 'avatar.jpg', 200, 200);
        }

        await toSql(insert, 'users');
      }

      offset += users.length;

      setTimeout(() => run(), 1000);
    });
}

run();
