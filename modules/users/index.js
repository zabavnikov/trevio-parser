const { SQL, Download } = require('../../classes');
const { User, Media, Company } = require('../../models');
const { UPLOAD_DISK } = require('../../constants');
const { uploadDirForPermanentImages } = require('../../utils/pathBuilder');

let offset = 0, limit = 500;

function run() {
  User
    .findAll({
      offset,
      limit,
    })
    .then(async users => {
      if (users.length === 0) return;

      for (let user of users) {
        user = user.get();

        const fields = {
          id:                 user.id,
          name:               user.name,
          email:              user.email,
          password:           user.password,
          description:        user.description,
          birthday:           user.birthday,
          gender:             user.gender,
          is_company:         user.Company ? true : false,
          email_verified_at:  user.created_at,
          last_activity_at:   user.last_activity_at,
          created_at:         user.created_at,
          updated_at:         user.updated_at,
        }

        // Парсим аватарку если есть.
        if (user.avatar > 0) {
          const path = uploadDirForPermanentImages(user.id);

          fields.avatar = `/users/${path}/avatar.jpg`;

          /*await new Download('users', user.Medium.filename, `users/${path}`, 'avatar.jpg')
              .setWidthHeight(200, 200)
              .download();*/
        }

        await new SQL('trevio.users', fields)
            .setOutputFolder('users')
            .parse();

        await new SQL('trevio.wallets', {
          user_id:    user.id,
          balance:    300,
        })
            .setOutputFolder('users')
            .parse();
      }

      offset += users.length;

      setTimeout(() => run(), 1000);
    });
}

run();
