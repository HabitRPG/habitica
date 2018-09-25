import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SEPTEMBER SUBSCRIBER ITEMS, GHOST AND GLOW-IN-THE-DARK HATCHING POTIONS, AND BLOG POST ON CONTRIBUTING TO HABITICA';
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
            <h2>9/25/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201809 center-block"></div>
        <h3>September Subscriber Items Revealed!</h3>
        <p>The September Subscriber Items have been revealed: the Autumnal Armor Item Set! You only have until September 30 to receive the item set <a href='/user/settings/subscription' target='_blank'>when you subscribe</a>. If you're already an active subscriber, reload the site and then head to Inventory > Items to claim your gear!</p>
        <p>Subscribers also receive the ability to buy Gems for Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_ghost_potions center-block"></div>
        <h3>Ghost and Glow-in-the-Dark Hatching Potions</h3>
        <p>We've brought back Ghost Potions, and added a brand-new Magic Hatching Potion: Glow-in-the-Dark! Between now and October 31st, you can buy these Hatching Potions from <a href='/shops/market' target='_blank'>the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Magic Hatching Potion Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
        <p>After they're gone, it will be at least a year before the Ghost or Glow-in-the-Dark Hatching Potions are available again, so be sure to get them now!</p>
        <div class="small mb-3">by Hermi, AaronTheTwin, tricksy.fox, and SabreCat</div>
        <div class="scene_painting center-block"></div>
        <h3>Blog Post: Contributing to Habitica</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2018/09/19/contributing-to-habitica/' target='_blank'>featured Wiki article</a> is about Contributing to Habitica. We hope that it will help you get involved with our open-source project and our great community! Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
        <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
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
