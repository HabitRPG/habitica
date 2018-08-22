import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'EMBER HATCHING POTIONS RETURN!';
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
          <div class="media-body">
            <div class="media align-items-center">
              <div class="mr-3 ${baileyClass}"></div>
              <div class="media-body">
                <h1 class="align-self-center">${res.t('newStuff')}</h1>
                <h2>8/21/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
              </div>
            </div>
            <hr/>
            <p>They're back! Between now and September 21, you can buy Ember Hatching Potions from <a href='/shops/market' target='_blank'>the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Ember Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
            <p>After they're gone, it will be at least a year before the Ember Hatching Potions are available again, so be sure to get them now!</p>
            <div class="small mb-3">by Balduranne and SabreCat</div>
          </div>
          <div class="promo_ember_potions ml-3 mb-3"></div>
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
