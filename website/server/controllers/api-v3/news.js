import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR SEPTEMBER ITEMS';
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
            <h2>9/30/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201909 center-block"></div>
        <h3>Last Chance for Affable Acorn Set</h3>
        <p>Reminder: this is the final day to <a href='/user/settings/subscription'>subscribe and receive the Affable Acorn Set</a>! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_rocking_reptiles_bundle center-block"></div>
        <h3>Last Chance for Rocking Reptiles Quest Bundle</h3>
        <p>This is also the final day to buy the discounted Rocking Reptiles Pet Quest Bundle, featuring the Alligator, Snake, and Velociraptor quests all for seven gems! Be sure to get your claws on it before it slithers away from the <a href='/shops/quests'>Quest Shop</a>!</p>
        <div class="small">Art by Gully, Willow The Witty, mfonda, UncommonCriminal, tabbytoes, EmeraldOx, LordDarkly, PainterProphet, Seraphina, Anna Glassman, Procyon, and Lilith of Alfheim</div>
        <div class="small mb-3">Writing by Mike.Antonacci, lilackbar, Daniel The Bard, and felipena</div>
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
