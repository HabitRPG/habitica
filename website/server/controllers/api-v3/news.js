import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW GLASS HATCHING POTIONS, AQUATIC HATCHING POTIONS, AND SEAFOAM!';
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
          <div class="promo_aquatic_glass_potions mr-3"></div>
          <div class="media-body">
            <h3>New Glass Magic Hatching Potions and the Return of Aquatic Potions!</h3>
            <p>There's a new pet breed in town! Between now and July 31, you can buy Glass and Aquatic Hatching Potions from <a href='/shops/market' target='_blank'>the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Magic Potion Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
            <p>After they're gone, it will be at least a year before the Glass and Aquatic Hatching Potions are available again, so be sure to get them now!</p>
            <div class="small mb-3">by stefalupagus, Beffymaroo, Mako413, Willow The Witty, and SabreCat</div>
            <h3>Seafoam!</h3>
            <p>Throw some Seafoam at your friends and they will turn into a cheerful sea star until their next cron! You can buy the Seafoam in the <a href='/shops/seasonal' target='_blank'>Seasonal Shop</a> for Gold. Plus, if you get splashed by Seafoam, you'll receive the Aquatic Friends badge!</p>
          </div>
          <div class="promo_seafoam ml-3"></div>
        </div>
        <p>Don't want to be a sea star? Just buy some Sand from your Rewards column to reverse it.</p>
        <p>Seafoam will be available until July 31st!</p>
        <div class="small mb-3">by Lemoness</div>
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
