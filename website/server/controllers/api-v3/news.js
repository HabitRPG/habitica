import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA NAMING DAY; LAST CHANCE FOR SUMMER SPLASH AND JULY SUBSCRIBER ITEMS';
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
            <h2>7/31/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Habitica Naming Day and Purple Gryphon Rewards!</h3>
            <p>Happy Habitica Naming day! In honor of the day when we changed the name of the app from HabitRPG to Habitica, we've given everyone an achievement, as well as some delicious cake for your pets and mounts.</p>
          </div>
          <div class="promo_naming_day_2018 ml-3 mb-3"></div>
        </div>
        <p>Speaking of pets and mounts, we've given all users Royal Purple Gryphon rewards! Depending on how many Naming Days you've celebrated with us, you've received Melior (a Purple Gryphon mount), his little sister Meliora (a Purple Gryphon pet), a Purple Gryphon Helm, or the Purple Gryphon Wing Cloak !</p>
        <p>Thanks for being a Habitica user -- you all mean so much to us. We hope that you enjoy your presents!</p>
        <div class="small mb-3">by Lemoness, Beffymaroo, and Baconsaur</div>
        <div class="media align-items-center">
          <div class="media-body">
            <div class="media align-items-center">
              <div class="promo_mystery_201807 mr-3"></div>
              <div class="media-body">
                <h3>Last Chance for Sea Serpent Set</h3>
                <p>Reminder: this is the final day to <a href='/user/settings/subscription' target='_blank'>subscribe</a> and receive the Sea Serpent Set! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you can get!</p>
                <p>Thanks so much for your support! You help keep Habitica running.</p>
                <div class="small mb-3">by Beffymaroo</div>
              </div>
            </div>
            <h3>Last Chance for Glass and Aquatic Hatching Potions</h3>
            <p>Reminder: this is the final day to <a href='/shops/market' target='_blank'>buy Glass and Aquatic Hatching Potions</a> If they come back, it won't be until next year at the earliest, so don't delay!</p>
            <div class="small mb-3">by stefalupagus, Beffymaroo, Mako413, Willow The Witty, and SabreCat</div>
            <h3>Last Chance for Summer Splash Goodies!</h3>
            <p>A reminder that Summer Splash is ending as well! Be sure to grab your special class gear from your Rewards column and any items you've been eyeing in the <a href='/shops/seasonal' target='_blank'>Seasonal Shop</a>!</p>
          </div>
          <div class="promo_aquatic_glass_potions ml-3 mb-3"></div>
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
