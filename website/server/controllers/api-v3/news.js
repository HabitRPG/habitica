import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA HARVEST FEAST! AND LAST CHANCE FOR NOVEMBER LIMITED TIME ITEMS';
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
            <h2>11/27/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_harvest_feast center-block"></div>
        <h3>Happy Harvest!</h3>
        <p>
          It's time for Habitica's Harvest Feast! On this day Habiticans celebrate by spending
          time with loved ones, giving thanks, enjoying their favorite foods, and riding their
          glorious turkeys into the magnificent sunset. Some of the NPCs are celebrating the
          occasion!
        </p>
        <h3>Turkey Pet, Mount, Costumes... and Pie!</h3>
        <p>
          Those of you who weren't around for all of our previous Harvest Feasts have received an
          adorable Turkey! What kind of Turkey? It all depends on how many harvests you've
          celebrated with us. If you've completed your Turkey collection, you'll receive a feast
          of delicious pie for your pets!
        </p>
        <p>Thank you for using Habitica - we really love you all <3</p>
        <div class="small mb-3">by Lemoness and Beffymaroo</div>
        <div class="promo_mystery_201911 center-block"></div>
        <h3>Last Chance for Crystal Charmer Subscriber Set</h3>
        <p>
          Reminder: the end of November is the last chance to receive the Crystal Charmer Set when
          you <a href='/user/settings/subscription'>sign up for a Habitica subscription!</a>
          Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems
          you can get!
        <p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_ember_thunderstorm_potions center-block"></div>
        <h3>Last Chance for Ember and Thunderstorm Potions</h3>
        <p>
          Reminder: time is running out to <a href='/shops/market'>buy Thunderstorm and Ember
          Hatching Potions!</a> If they come back, it won't be until next year at the earliest, so
          don't delay!
        </p>
        <div class="small mb-3">by Balduranne and SabreCat</div>
        <div class="promo_delightful_dinos center-block"></div>
        <h3>Last Chance for Delightful Dinos Pet Quest Bundle</h3>
        <p>
          There's also only a few days left to buy the discounted Delightful Dinos Pet Quest
          Bundle, featuring the Pterodactyl, Triceratops, and T-Rex quests all for seven Gems! Be
          sure to get yours from the <a href='/shops/quests'>Quest Shop</a> before this deal goes
          extinct!
        </p>
        <div class="small">By SabreCat and Beffymaroo</div>
        <div class="small">
          Art by Baconsaur, Eevachu, UncommonCriminal, Kiwibot, McCoyly, plumilla, Seraphina,
          PainterProphet, Stefalupagus, Katy133, Edge, Willow The Witty, Lilith of Alfheim,
          Procyon, GeraldThePixel, and Archeia
        </div>
        <div class="small mb-3">
          Writing by Lemoness, Daniel the Bard, Lilith of Alfheim, and Ali Stewart
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
