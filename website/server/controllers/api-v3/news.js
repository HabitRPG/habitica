import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'FEBRUARY SUBSCRIBER ITEMS AND BEHIND THE SCENES BLOG';
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
        <h2>2/22/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <h3>February Subscriber Items Revealed!</h3>
        <p>The February Subscriber Items have been revealed: The Love Bug Set!! It's a special three-piece set in honor of our ongoing battle with the Dysheartener. You only have until February 28 to receive the item set when you <a href='/user/settings/subscription'>subscribe</a>. If you're already an active subscriber, reload the site and then head to Inventory > Items to claim your gear!</p>
        <p>Subscribers also receive the ability to buy Gems for Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="promo_mystery_201802 center-block"></div>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Behind the Scenes: Bringing a World Boss to Life</h3>
            <p>There's a new <a href='https://habitica.wordpress.com/2018/02/22/behind-the-scenes-bringing-a-world-boss-to-life/' target='_blank'>Behind the Scenes post</a> on the Habitica blog! Ever wonder what goes into bringing a World Boss to Habitica? Check out this post for a behind the scenes glimpse of how the team makes these events happen. It's all fun and no spoilers (we promise)!</p>
            <div class="small mb-3">by Beffymaroo</div>
          </div>
          <div class="promo_seasonalshop_broken ml-3"></div>
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
