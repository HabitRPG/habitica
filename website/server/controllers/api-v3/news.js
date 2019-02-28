import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR LOTS OF GOODIES!';
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
            <h2>2/28/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201902 center-block"></div>
        <h3>Last Chance for Cryptic Crush Set</h3>
        <p>Reminder: this is the final day to <a href='/user/settings/subscription'>subscribe</a> and receive the Cryptic Crush Set! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_valentines_potions center-block"></div>
        <h3>Last Chance for Cupid and Rose Quartz Hatching Potions</h3>
        <p>Reminder: this is the final day to <a href='/shops/market'>buy Cupid and Rose Quartz Hatching Potions</a>! If they come back, it won't be until next year at the earliest, so don't delay!</p>
        <div class="small mb-3">by Vampitch and Willow the Witty</div>
        <div class="promo_mythical_marvels_bundle center-block"></div>
        <h3>Last Chance for Mythical Marvels Pet Quest Bundle</h3>
        <p>This is also the final day to buy the discounted Mythical Marvels Pet Quest Bundle, featuring the Unicorn, Gryphon, and Sea Serpent quests all for seven Gems! Be sure to check it out in the <a href='/shops/quests'>Quest Shop</a>before it fades into legend!</p>
        <div class="small">Art by greenpencil, UncommonCriminal, RosieSully, Lukreja, Baconsaur, Witticaster, Aries Faries, Mara, Seraphina, 1920-kun, RBrinks, and Erikari</div>
        <div class="small mb-3">Writing by Laurel, Daniel the Bard, and gwyllgi</div>
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
