import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR APRIL GOODIES!';
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
            <h2>4/30/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_classes_spring2019 center-block"></div>
        <h3>Last Chance for Spring Fling Outfits, Customizations, Magic Hatching Potions, and Shiny Seeds</h3>
        <p>Today is the final day of the Spring Fling Festival, so if you still have any remaining Spring Fling Items that you want to buy, you'd better do it now! The special Spring Fling Equipment will not return for at least one year and will be available for gems instead of gold when it returns.</p>
        <p>Pastel Skins and Shimmer Hair colors will also vanish when the Gala ends, so be sure to grab them from User > Edit Avatar!</p>
        <p>Rainbow, Celestial, and Garden Magic Hatching Potions are also disappearing from the <a href='/shops/market'>Market</a> when the Gala ends. Make sure you snag all the potions you need before they're gone!</p>
        <p>Plus, the <a href='/shops/seasonal'>Seasonal Shop</a> will be closing down, so now's the time to seize those final items and stock up on Shiny Seeds!</p>
        <div class="promo_mystery_201904 center-block"></div>
        <h3>Last Chance for Opulent Opal Set</h3>
        <p>Reminder: this is the final day to <a href='/user/settings/subscription'>subscribe</a> and receive the Opulent Opal Set! Subscribing also lets you buy Gems with Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
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
