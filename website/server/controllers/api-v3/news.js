import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW GLASSES OPTION FOR AVATARS AND LAST CHANCE FOR MAY LIMITED-TIME ITEMS';
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
            <h2>5/30/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_halfmoon_glasses center-block"></div>
        <h3>New Glasses Option for Avatars</h3>
        <p>We have a new set of free avatar customizations available: half-moon glasses! We hope that all you glasses-wearing Habiticans out there will enjoy these new options. You can find them in User>Edit Avatar>Extras.</p>
        <div class="small mb-3">by Breadstrings and SabreCat</div>
        <div class="promo_mystery_201905 center-block"></div>
        <h3>Last Chance for Dazzling Dragon Set</h3>
        <p>Reminder: tomorrow is the final day to <a href='/user/settings/subscription'>subscribe</a> and receive the Dazzling Dragon Set! Subscribing also lets you buy Gems with Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_floral_sunshine_potions center-block"></div>
        <h3>Last Chance for Sunshine and Floral Hatching Potions</h3>
        <p>Reminder: tomorrow is the final day to <a href='/shops/market'>buy Sunshine and Floral Hatching Potions</a>! If they come back, it won't be until next year at the earliest, so don't delay!</p>
        <div class="small mb-3">by OuttaMyMind, Lt.Cabel, Eslyn, Mako, and SabreCat</div>
        <div class="promo_feathered_friends_bundle center-block"></div>
        <h3>Last Chance for Feathered Friends Quest Bundle</h3>
        <p>Tomorrow is also the final day to buy the discounted Feathered Friends Pet Quest Bundle, featuring the Falcon, Parrot, and Owl quests all for seven Gems! Be sure to get a few in your talons before they fly away! The bundle can be found in the <a href='/shops/quests'>Quest Shop</a>.</p>
        <div class="small">by Lemoness and SabreCat</div>
        <div class="small">Art by Casey, Teto Forever, Eevachu, UncommonCriminal, JonArinbjorn, Trogdorina, Onheiron, Squish</div>
        <div class="small mb-3">Writing by Lemoness, Token, and Bartelmy</div>
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
