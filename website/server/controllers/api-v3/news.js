import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'THREE WINTRY MAGIC HATCHING POTIONS! AND DECEMBER MYSTERY ITEMS REVEALED';
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
            <h2>12/20/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_snow_potions center-block"></div>
        <h3>Icy Snow, Starry Night, and Peppermint Hatching Potions</h3>
        <p>There's a new pet breed in town, and a couple of exciting re-releases! Between now and January 31st, you can buy Starry Night, Peppermint, and new Icy Snow Hatching Potions from <a href='/shops/market'>the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Magic Potion Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
        <p>After they're gone, it will be at least a year before these Hatching Potions are available again, so be sure to get them now!</p>
        <div class="small mb-3">by JinjooHat, Vampitch, Lemoness, and SabreCat</div>
        <div class="promo_mystery_201812 center-block"></div>
        <h3>December Subscriber Items Revealed!</h3>
        <p>The December Subscriber Set has been revealed: the Arctic Fox Item Set! You only have until December 31 to <a href='/user/settings/subscription'>receive the item set when you subscribe</a>. If you're already an active subscriber, reload the site and then head to Inventory > Items to claim your gear!</p>
        <p>Subscribers also receive the ability to buy Gems with Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
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
