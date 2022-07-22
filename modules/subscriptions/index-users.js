const { SQL } = require('../../classes');
const { EVENTS } = require('../../constants');
const SubscriptionUser = require('../subscriptions/models/SubscriptionUser');

let offset = 0, unique = {};

function run() {
  SubscriptionUser
    .findAll({
      offset,
      limit: 100,
    })
    .then(async subscriptions => {
      if (subscriptions.length === 0) return;

      for (let subscription of subscriptions) {
        subscription = subscription.get();

        const uniqueKey = subscription.subscriber_id + 'users' + subscription.model_id;

        // В базе есть дубли, поэтому выбираем только уникальные записи.
        if (! unique.hasOwnProperty(uniqueKey)) {
          await new SQL('trevio.subscriptions', {
            subscriber_id: subscription.subscriber_id,
            model_user_id: subscription.model_id,
            model_type: 'users',
            model_id: subscription.model_id,
            created_at: subscription.created_at,
          })
              .setOutputFilename('trevio.subscriptions_users')
              .setOutputFolder('subscriptions')
              .parse();

          await new SQL('trevio.activity', {
            key: `emitter${subscription.subscriber_id}users${subscription.model_id}`,
            type_id: EVENTS.subscriptions.eventId,
            weight: EVENTS.subscriptions.weight,
            emitter_id: subscription.subscriber_id,
            recipient_id: subscription.model_id,
            model_type: 'users',
            model_id: subscription.model_id,
            created_at: subscription.created_at,
          })
              .setOutputFilename('trevio.subscriptions_users_activity')
              .setOutputFolder('subscriptions')
              .parse();

          unique[uniqueKey] = true;
        }
      }

      offset += subscriptions.length;

      setTimeout(() => run(), 1000);
    });
}

run();
