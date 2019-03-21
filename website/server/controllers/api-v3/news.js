import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SPRING FLING BEGINS! LIMITED EDITION EQUIPMENT, SEASONAL SHOP, AND EGG QUEST!';
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
            <h2>3/19/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_classes_spring2019 center-block"></div>
        <h3>Limited Edition Class Outfits</h3>
        <p>From now until April 30th, limited edition outfits are available in the Rewards column! Depending on your class, you can be a Cloud Rogue, Robin Healer, Amber Mage, or Orchid Warrior. You'd better get productive to earn enough Gold before your time runs out...</p>
        <div class="small mb-3">by Eslyn, Aspiring Advocate, OuttaMyMind, Lt. Cabel, Beffymaroo and SabreCat</div>
        <div class="promo_seasonalshop_spring center-block"></div>
        <h3>Seasonal Shop Opens</h3>
        <p>The <a href='/shops/seasonal'>Seasonal Shop</a> has opened! It's stocking springtime Seasonal Edition goodies at the moment, including past spring outfits. Everything there will be available to purchase during the Spring Fling event each year, but it's only open until April 30th, so be sure to stock up now, or you'll have to wait a year to buy these items again!</p>
        <div class="small mb-3">by Vikte, Lalaitha, DialFForFunky, Gerald the Pixel, Scarvia, Awesome kitty, usnbfs, Lemoness, Balduranne, PainterProphet, Beffymaroo and SabreCat</div>
        <div class="promo_egg_hunt center-block"></div>
        <h3>Egg Quest Available</h3>
        <p>The Egg Quest is also available again in the <a href='/shops/seasonal'>Seasonal Shop</a>! Strange eggs are appearing all over Habitica. Can you collect them all to earn some colorful Egg pets and mounts?</p>
        <div class="small mb-3">by Megan, Beffymaroo, and Lemoness</div>
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
