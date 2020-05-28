import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR MAY ITEMS';
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
            <h2>5/28/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_202005 center-block"></div>
        <h3>Last Chance for Wondrous Wyvern Set</h3>
        <p>
          Reminder: you only have until May 31 to receive the Wondrous Wyvern Set when you <a
          href='/user/settings/subscription'>sign up for a new Habitica subscription</a>!
          Subscribing also gives you lots of great perks, like the ability to buy Gems with Gold.
          The longer your subscription, the more Gems you can get!
        </p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_fairy_sunshine_potions center-block"></div>
        <h3>Last Chance for Fairy and Sunshine Glow Hatching Potions</h3>
        <p>
          Reminder: Fairy and Sunshine Glow Hatching Potions leave <a href='/shops/market'>the
          Market</a> on May 31. If they come back, it won't be until next year at the earliest, so
          don't delay!
        </p>
        <div class="small mb-3">by OuttaMyMind, Lt.Cabel, Eslyn, Edge, and SabreCat</div>
        <div class="promo_jungle_buddies_bundle center-block"></div>
        <h3>Last Chance for Jungle Buddies Pet Quest Bundle</h3>
        <p>
          Don't forget to check out the discounted Jungle Buddies Pet Quest Bundle, featuring the
          Monkey, Sloth, and Treeling quests all for seven Gems! Be sure to snag it before it makes
          like a tree and leaves the <a href='/shops/quests'>Quest Shop</a> on May 31!
        </p>
        <div class="small">by SabreCat</div>
        <div class="small">Writing by PixelHunter, Emily Austin, Flutter Bee, and Felipe NA</div>
        <div class="small mb-3">
          Art by JaizakAripaik, Drevian, McCoyly, awakebyjava, PainterProphet, Kiwibot,
          greenpencil, fuzzytrees, PainterProphet, aurakami, yamato, leephon, Misceo, and
          Oneironaut
        </div>
      </div>
      `,
    });
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Allow latest Bailey announcement to be read later
 * @apiName TellMeLaterNews
 * @apiDescription Add a notification to allow viewing of the latest "New Stuff by Bailey" message.
 * Prevent this specific Bailey message from appearing automatically.
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
