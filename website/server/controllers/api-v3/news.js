import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW AND RERELEASED HATCHING POTIONS! PLUS BLOG UPDATES';
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
            <h2>9/26/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_shadow_spooky_potions center-block"></div>
        <h3>New Shadow Magic Hatching Potions, Plus the Return of Spooky and Glow-in-the-Dark Potions!</h3>
        <p>There's a new pet breed in town! Between now and October 31st, you can buy  Magic Hatching Potions from <a href='/shops/market'>the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Magic Potion Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
        <p>For this Gala, we've brought back Glow-in-the-Dark Potions and Spooky Potions, and added a brand-new potion: Shadow!</p>
        <p>After they're gone, it will be at least a year before these Hatching Potions are available again, so be sure to get them now!</p>
        <div class="small mb-3">by Lemoness, QuartzFox, AaronTheTwin, tricksy.fox, and SabreCat</div>
        <div class="scene_casting_spells center-block"></div>
        <h3>Blog Post: Mage</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/09/25/mage/' target='_blank'>featured Wiki article</a> is about the Mage Class! We hope that it will help you as you choose the best class for your Habitica play style. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
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
