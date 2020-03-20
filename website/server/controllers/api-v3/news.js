import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'SPRING FLING BEGINS! LIMITED EDITION EQUIPMENT, SEASONAL SHOP, AND MAGIC HATCHING POTIONS!';
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
            <h2>3/19/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_spring_2020 center-block"></div>
        <h3>Limited Edition Class Outfits</h3>
        <p>
          From now until April 30th, limited edition outfits are available in the Rewards column!
          Depending on your class, you can be a Rhinoceros Beetle Warrior, Iris Healer, Lapis
          Lazuli Rogue, or Puddle Mage. You'd better get productive to earn enough Gold before your
          time runs out...
        </p>
        <div class="small mb-3">by Vikte, gawrone, jjgame83, Shine Caramia, and SabreCat</div>
        <div class="promo_seasonal_shop_spring center-block"></div>
        <h3>Seasonal Shop Opens</h3>
        <p>
          The <a href='/shops/seasonal'>Seasonal Shop</a> has opened! It's stocking springtime
          Seasonal Edition goodies at the moment, including past spring outfits. Everything there
          will be available to purchase during the Spring Fling event each year, but it's only open
          until April 30th, so be sure to stock up now, or you'll have to wait a year to buy these
          items again!
        </p>
        <div class="small mb-3">
          by Eslyn, Aspiring Advocate, OuttaMyMind, Lt. Cabel, Vikte, Lalaitha, DialFForFunky,
          Gerald the Pixel, Scarvia, Awesome kitty, usnbfs, Lemoness, Balduranne, PainterProphet,
          Beffymaroo, and SabreCat
        </div>
        <div class="promo_spring_potions_2020 center-block"></div>
        <h3>Spring Fling Magic Hatching Potions</h3>
        <p>
          There's a new pet breed in town! Check out the brand-new Birch Bark Potions and the
          return of Shimmer and Celestial Potions to brighten your Spring avatar look from <a
          href='/shops/market'>the Market</a> and use them to hatch any standard pet egg. (Magic
          Hatching Potions do not work on Quest Pet eggs.) Magic Hatching Potion Pets aren't picky,
          so they'll happily eat any kind of food that you feed them!
        </p>
        <p>
          These potions will be available until Spring Fling ends on April 30. After they're gone,
          it will be at least a year before these Hatching Potions return, so be sure to get them
          now!
        </p>
        <div class="small mb-3">
          by Teto Forever, tricksy.fox, Bonogo, Mara, ravenlune, Ricardo, and SabreCat
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
