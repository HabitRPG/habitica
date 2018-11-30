import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE! SPLENDID SORCERER SET, FROST HATCHING POTIONS, ODDBALLS QUEST BUNDLE';
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
            <h2>11/30/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201811 center-block"></div>
        <h3>Last Chance for Splendid Sorcerer Item Set</h3>
        <p>Reminder: this is the final weekend to <a href='/user/settings/subscription' target='_blank'>subscribe</a> and receive the Splendid Sorcerer Set! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_frost_potions center-block"></div>
        <h3>Last Chance for Frost and Thunderstorm Hatching Potions</h3>
        <p>This weekend is also your last chance to <a href='/shops/market' target='_blank'>buy Frost and Thunderstorm Hatching Potions</a>! If they come back, it won't be until next year at the earliest, so don't delay!</p>
        <div class="small mb-3">by Balduranne</div>
        <div class="promo_oddballs_bundle center-block"></div>
        <h3>Last Chance for Oddball Pet Quest Bundle</h3>
        <p>And finally, this weekend is all that's left to buy the discounted Oddballs Pet Quest Bundle, featuring the Yarn, Rock, and Marshmallow Slime quests all for seven Gems! Be sure to glomp it from the <a href='/shops/quests' target='_blank'>Quest Shop</a> right away!</p>
        <div class="small">Art by PainterProphet, Pfeffernusse, Zorelya, intune, starsystemic, Leephon, Arcosine, stefalupagus, Hachiseiko, TheMushroomKing, khdarkwolf, Vampitch, JinjooHat, UncommonCriminal, Oranges, Darkly, overomega, celticdragon, and Shaner</div>
        <div class="small mb-3">Writing by Bartelmy, Faelwyn the Rising Phoenix, Theothermeme, Bethany Woll, itokro, and Lemoness</div>
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
