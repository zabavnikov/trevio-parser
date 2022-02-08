const { SQL, Download } = require('../../classes');
const { Company, Media, User } = require('../../models');
const { UPLOAD_DISK } = require('../../constants');
const { uploadDirForPermanentImages } = require('../../utils/pathBuilder');

let offset = 0, limit = 500;

function run() {
  User
    .findAll({
      offset,
      limit,
      include: [
        { model: Media, required: false },
        { model: Company, required: false }
      ],
    })
    .then(async users => {
      if (users.length === 0) return;

      for (let user of users) {
        user = user.get();

        const isCompany = user.Company !== null;

        if (isCompany) {
          user.name = user.Company.name;

          if (user.Company.description.length) {
            user.description = user.Company.description;
          }
        }

        if (user.description && user.description.length > 499) {
          user.description = user.description.substr(0, 499);

          if (user.description[user.description.length - 1] !== '.') {
            user.description[user.description.length - 1] += '.';
          }
        }

        const fields = {
          id:                 user.id,
          name:               user.name,
          email:              user.email,
          password:           user.password,
          description:        user.description,
          birthday:           user.birthday,
          gender:             user.gender,
          is_company:         isCompany,
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
