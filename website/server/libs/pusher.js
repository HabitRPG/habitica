import Pusher from 'pusher';
import nconf from 'nconf';
import { InternalServerError } from './errors';

const IS_PUSHER_ENABLED = nconf.get('PUSHER:ENABLED') === 'true';

let pusherInstance;

if (IS_PUSHER_ENABLED) {
  pusherInstance = new Pusher({
    appId: nconf.get('PUSHER:APP_ID'),
    key: nconf.get('PUSHER:KEY'),
    secret: nconf.get('PUSHER:SECRET'),
    encrypted: true,
  });
}

let api = {
  // https://github.com/pusher/pusher-http-node#publishing-events
  trigger (channel, event, data, socketId = null) {
    if (!IS_PUSHER_ENABLED) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      pusherInstance.trigger(channel, event, data, socketId, (err, req, res) => {
        if (err) {
          reject(err);
        } else {
          resolve([req, res]);
        }
      });
    });
  },

  // https://github.com/pusher/pusher-http-node#authenticating-private-channels
  authenticate (...args) {
    if (!IS_PUSHER_ENABLED) throw new InternalServerError('Pusher is not enabled.');

    return pusherInstance.authenticate(...args);
  },
};

module.exports = api;
