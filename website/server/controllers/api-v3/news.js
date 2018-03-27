import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'MARCH SUBSCRIBER ITEMS AND BEHIND THE SCENES BLOG';
const worldDmg = { // @TODO
  bailey: false,
};

/**
 * @api {get} /api/v3/news Get latest Bailey announcement
 * @apiName GetNews
 * @apiGroup News
 *
 *
 * @apiSuccess {Object} html Latest Bailey html
 *
 */
api.getNews = {
  method: 'GET',
  url: '/news',
  async handler (req, res) {
    const baileyClass = worldDmg.bailey ? 'npc_bailey_broken' : 'npc_bailey';

    res.status(200).send({
      html: `
      <div class="bailey">
        <div class="media">
          <div class="align-self-center mr-3 ${baileyClass}"></div>
          <div class="media-body">
            <h1 class="align-self-center">${res.t('newStuff')}</h1>
          </div>
        </div>
        <h2>3/22/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>March Subscriber Items Revealed!</h3>
            <p>The March Subscriber Item has been revealed: the Daring Dragonfly Set! You'll receive this set when you <a href='/user/settings/subscription' target='_blank'>subscribe</a> by March 31! If you're already an active subscriber, reload the site and then head to Inventory > Equipment to claim your gear!</p>
          </div>
          <div class="promo_mystery_201803"></div>
        </div>
        <p>Subscribers also receive the ability to buy Gems for Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="media align-items-center">
          <div class="scene_podcast mb-3 mr-3"></div>
          <div class="media-body">
            <h3>Behind the Scenes: Staff Podcast Picks!</h3>
            <p>Looking for new podcasts? The Habitica team loves podcasts, and in this special post we wanted to share some favorites that help us get things done, learn, and have fun! Come check them out in <a href='https://habitica.wordpress.com/2018/03/22/behind-the-scenes-habitica-staff-podcast-picks/' target='_blank'>this month's Behind the Scenes feature!</a></p>
            <div class="small mb-3">by Beffymaroo and the rest of the Habitica team</div>
          </div>
        </div>
      </div>
      `,
    });
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Get latest Bailey announcement in a second moment
 * @apiName TellMeLaterNews
 * @apiGroup News
 *
 *
 * @apiSuccess {Object} data An empty Object
 *
 */
api.tellMeLaterNews = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/news/tell-me-later',
  async handler (req, res) {
    const user = res.locals.user;

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => {
      return n && n.type === 'NEW_STUFF';
    });
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;
