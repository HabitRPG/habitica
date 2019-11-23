import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NOVEMBER SUBSCRIBER ITEMS AVAILABLE! AND UPCOMING CHANGES TO MYSTERY ITEM DISTRIBUTION';
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
        <div class="media align-items-center">
          <div class="mr-3 ${baileyClass}"></div>
          <div class="media-body">
            <h1 class="align-self-center">${res.t('newStuff')}</h1>
            <h2>11/21/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>November Subscriber Items Revealed!</h3>
        <p>
          The November Subscriber Item has been revealed: the Crystal Charmer Item Set! You only
          have until November 30 to <a href='/user/settings/subscription'>receive the item set
          when you subscribe</a>. If you're already an active subscriber, reload the site and then
          head to Inventory > Items to claim your gear!
        </p>
        <p>
          Subscribers also receive the ability to buy Gems for Gold -- the longer you subscribe,
          the more Gems you can buy per month! There are other perks as well, such as longer
          access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us
          keep Habitica running. Thank you very much for your support -- it means a lot to us.
        </p>
        <div class="promo_mystery_201911 center-block"></div>
        <h3>Subscriber Gear Release Changes</h3>
        <p>
          Starting next month, we're changing the way Subscriber sets are released! We'll be
          releasing the outfits at the beginning of the month. With this change, subscribers can
          enjoy their new gear all month long, and new subscribers will receive the latest gear
          set as soon as they sign up, any day of that month. The gear will come out around the
          first of the month, with a little wiggle room for time zones much like when Gem-buying
          caps reset. We hope this change helps you enjoy your subscription even more!
        </p>
        <div class="small mb-3">by Beffymaroo and SabreCat</div>
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
    const { user } = res.locals;

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => n && n.type === 'NEW_STUFF');
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

export default api;
