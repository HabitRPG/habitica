import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE: GIFT A SUBSCRIPTION AND GET ONE FREE!';
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
            <h2>1/14/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_g1g1 center-block"></div>
        <p>Tomorrow is your last chance to take advantage of our promotion where if you gift somebody a subscription, you get the same subscription for yourself for free!</p>
        <p>Subscribers get tons of perks every month, including exclusive items, the ability to buy Gems with Gold, and a cute exclusive Jackalope Pet. Plus, it helps keep Habitica running :) To gift a subscription to someone, just open their profile and click on the present icon in the upper right.</p>
        <p>The special promotion will only run until tomorrow, so if you've been curious about trying out a subscription, now's the time! Make a friend happy and use all your new Gems to go questing together.</p>
        <p>Please note that if you or your gift recipient already have a recurring subscription, the gifted subscription will only start after that subscription is cancelled or has expired. Thanks so much for your support! <3</p>
        <div class="small mb-3">by SabreCat, Beffymaroo and Lemoness</div>
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
