const { SQL } = require('../../../classes');
const Like = require('../../likes/models/Like');

module.exports = async (where) => {
  const likes = await Like.findAll({
    where: {
      module_type: 1,
      ...where
    }
  });

  if (likes.length) {
    for (const like of likes) {
      await new SQL('trevio.travels_likes', {
        user_id:    like.user_id,
        model_id:   like.likes_id,
        created_at: like.created_at,
      })
          .setDumpFolder('travels')
          .parse();
    }
  }

  return likes.length;
}