import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR APRIL GOODIES!';
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
        <h2>4/30/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="promo_spring_fling_2018 mr-3"></div>
          <div class="media-body">
            <div class="media">
              <div class="media-body">
                <h3>Last Chance for Spiffy Squirrel Set</h3>
                <p>Reminder: this is the final day to <a href='/user/settings/subscription' target='_blank'>subscribe and receive the Spiffy Squirrel Set</a>! Subscribing also lets you buy gems for gold. The longer your subscription, the more gems you get!</p>
              </div>
              <div class="promo_mystery_201804"></div>
            </div>
            <p>Thanks so much for your support! You help keep Habitica running.</p>
            <div class="small mb-3">by Beffymaroo</div>
            <h3>Last Chance for Spring Fling Hatching Potions, Equipment, Avatar Skins and Hair Colors, and Seasonal Shop Items</h3>
            <p>Spring Fling is coming to a close, so be sure to grab any exciting items you've had your eye on! This includes the <a href='/shops/market' target='_blank'>Shimmer and Rainbow Hatching Potions in the Market</a>. If they come back, it won't be until next year at the earliest, so don't delay!</p>
            <p>Pastel Skins and Shimmer Hair colors will also disappear when the Gala ends. If you purchase them in User > Avatar, you can use them year-round!</p>
            <p>Be sure to also get your limited edition Spring Fling equipment in your Rewards Column! When it returns next year, it will be in the Seasonal Shop and will be available for gems rather than gold.</p>
            <p>And lastly, it's a great time to stock up on items from the <a href='/shops/seasonal' target='_blank'>Seasonal Shop</a> before it closes. This includes past Spring Fling equipment, the Egg Hunt Quest, and Shiny Seeds!</p>
            <div class="small mb=3">by Scarvia, Awesome kitty, usnbfs, Lemoness, Balduranne, PainterProphet, Vikte, Lalaitha, DialFForFunky, Gerald the Pixel, Beffymaroo and SabreCat</div>
          </div>
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
