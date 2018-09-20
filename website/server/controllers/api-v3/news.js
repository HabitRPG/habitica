import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'FALL FESTIVAL BEGINS! LIMITED EDITION FALL EQUIPMENT, SEASONAL SHOP OPENS, AND NPC OUTFITS!';
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
            <h2>9/20/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_fall_festival_2018 center-block"></div>
        <h3>Limited Edition Class Outfits!</h3>
        <p>From now until October 31st, limited edition outfits are available in the Rewards column! Depending on your class, you can be a Minotaur Warrior, an Alter Ego Rogue, a Carnivorous Plant Healer, or a Candymancer Mage. You'd better get productive to earn enough gold before your time runs out...</p>
        <div class="small mb-3">by AnnDeLune, Vikte, QuartzFox, Beffymaroo, and SabreCat</div>
        <div class="promo_fall_festival_2017 center-block"></div>
        <h3>Seasonal Shop Opens</h3>
        <p>The <a href='/shops/seasonal' target='_blank'>Seasonal Shop</a> has opened! It's stocking autumnal Seasonal Edition goodies at the moment, including past fall outfits. Everything there will be available to purchase during the Fall Festival event each year, but it's only open until October 31st, so be sure to stock up now, or you'll have to wait a year to buy these items again!</p>
        <div class="small mb-3">by AnnDeLune, ʂʈєƒąʃųƥągųʂ, Katy133, Lilith of Alfheim, Definitely not a villain, ShoGirlGeek. cataclysms, maxpendragon, Lemoness, Beffymaroo, and SabreCat</div>
        <h3>NPC Outfits</h3>
        <p>Everyone has hastened down to the Flourishing Fields to celebrate this spooky harvest festival. Be sure to check out all the new outfits that people are sporting!</p>
        <div class="promo_seasonal_shop center-block"></div>
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
