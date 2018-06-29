import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR ALLURING ANGLERFISH SET AND AQUATIC AMIGOS QUEST BUNDLE; FEATURED WIKI ON GUILD CREATION';
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
            <h2>6/26/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Last Chance for Alluring Anglerfish Set</h3>
            <p>Reminder: this weekend is your last chance to <a href='/user/settings/subscription' target='_blank'>subscribe</a> and receive the Alluring Anglerfish Set! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
            <p>Thanks so much for your support! You help keep Habitica running.</p>
            <div class="small mb-3">by Beffymaroo</div>
          </div>
          <div class="promo_mystery_201806"></div>
        </div>
        <div class="promo_bundle_aquaticAmigos center-block mb-3"></div>
        <h3>Last Chance for Aquatic Amigos Pet Quest Bundle</h3>
        <p>This is also the final weekend to buy the discounted Aquatic Amigos Pet Quest Bundle, featuring the Axolotl, Cuttlefish, and Octopus quests all for seven Gems! Be sure to check it out in the <a href='/shops/quests' target='_blank'>Quest Shop</a> before it floats away!</p>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Blog Post: Guild Creation and Maintenance Tips</h3>
            <p>This month's <a href='https://habitica.wordpress.com/2018/06/27/guild-creation-and-maintenance-tips/' target='_blank'>featured Wiki article</a> is about Guild Creation and Maintenance! We hope that it will help you as explore Habitica's social spaces. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
            <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
          </div>
          <div class="scene_tavern"></div>
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
  middlewares: [authWithHeaders({
    userFieldsToExclude: ['inbox'],
  })],
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
