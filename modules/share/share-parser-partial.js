const { SQL } = require('../../classes');
const { EVENTS } = require('../../constants');
const Share = require('./models/Share');

module.exports = async (outputFolder, tableName, where, model) => {
  const shares = await Share.findAll({
    where
  });

  for (let share of shares) {
    share = share.get();
    share.recipient_id = null;

    await new SQL(`trevio.${tableName}`, {
      user_id:    share.user_id,
      model_id:   share.model_id,
      created_at: share.created_at,
    })
        .setOutputFolder(outputFolder)
        .parse();

    await new SQL('trevio.activity', {
      key:          `emitter${share.user_id}${share.model_type}${share.model_id}`,
      event_id:     EVENTS.share.eventId,
      weight:       EVENTS.share.weight,
      emitter_id:   share.user_id,
      recipient_id: model.user_id,
      model_type:   model.type,
      model_id:     model.id,
      created_at:   share.created_at,
    })
        .setOutputFilename(`trevio.${tableName}_activity`)
        .setOutputFolder(outputFolder)
        .parse();
  }

  return shares;
}