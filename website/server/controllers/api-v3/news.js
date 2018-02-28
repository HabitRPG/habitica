import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SECOND DYSHEARTENER RAGE STRIKE! LAST CHANCE FOR LOVE BUG SET AND CUPID POTIONS';
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
          </div>
        </div>
        <h2>2/28/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <h3>World Boss: Dysheartener Attacks the Market!</h3>
        <p>Help! After feasting on our incomplete Dailies, the Dysheartener lets out another Shattering Heartbreak attack, smashing the walls and floor of the Market! As stone rains down, Alex the Merchant weeps at his crushed merchandise, stricken by the destruction.</p>
        <p>We can't let this happen again! Be sure to do all our your Dailies to prevent the Dysheartener from using its final strike.</p>
        <div class="small mb-3">by Lemoness, Beffymaroo, SabreCat, viirus, piyorii, and Apollo</div>
        <div class="media d-flex align-items-center">
          <div class="media-body">
            <h3>Last Chance for Love Bug Set</h3>
            <p>Reminder: this is the final day to <a href='/user/settings/subscription' target='_blank'>subscribe</a> and receive the Love Bug Set! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
            <p>Thanks so much for your support! You help keep Habitica running.</p>
            <div class="small mb-3">by Beffymaroo</div>
            <h3>Last Chance for Cupid Hatching Potions</h3>
            <p>Reminder: this is the final day to <a href='/shops/market' target='_blank'>buy Cupid Hatching Potions!</a> If they come back, it won't be until next year at the earliest, so don't delay!</p>
            <div class="small mb-3">by Willow the Witty and SabreCat</div>
          </div>
          <div class="promo_cupid_potions ml-3"></div>
        </div>
        <div class="promo_mystery_201802 center-block"></div>
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
