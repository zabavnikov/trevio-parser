const { SQL } = require('../../classes');
const { EVENTS } = require('../../constants');
const Like = require('./models/Like');

module.exports = async (outputFolder, tableName, where, model = {}) => {
  const likes = await Like.findAll({
    where
  });

  if (likes.length) {
    for (const like of likes) {
      await new SQL(`trevio.${tableName}`, {
        user_id:    like.user_id,
        model_id:   like.likes_id,
        created_at: like.created_at,
      })
          .setDumpFolder(outputFolder)
          .parse();

      const activityFields = {
        key:          `emitter${like.user_id}${model.type}${model.id}`,
        type_id:     EVENTS.likes.eventId,
        emitter_id:   like.user_id,
        recipient_id: model.user_id,
        model_type:   model.type,
        model_id:     model.id,
        created_at:   like.created_at,
      };

      if (model.hasOwnProperty('travel_id')) {
        activityFields.travel_id = model.travel_id;
      }

      /*await new SQL('trevio.activity', activityFields)
          .setFilename(`trevio.${tableName}_activity`)
          .setDumpFolder(outputFolder)
          .parse();*/
    }
  }

  return likes;
}