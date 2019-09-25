import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'FALL FESTIVAL BEGINS! SEPTEMBER SUBSCRIBER ITEMS!';
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
            <h2>9/24/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201909 center-block"></div>
        <h3>September Subscriber Items Revealed!</h3>
        <p>The September Subscriber Item Set has been revealed: the Affable Acorn Item Set! You only have until September 30 to <a href='/user/settings/subscription'>receive the item set when you subscribe</a>. If you're already an active subscriber, reload the site and then head to Inventory > Items to claim your gear!</p>
        <p>Subscribers also receive the ability to buy Gems for Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_fall_festival_2019 center-block"></div>
        <h3>Limited Edition Class Outfits</h3>
        <p>From now until October 31st, limited edition outfits are available in the Rewards column! Depending on your class, you can be a Raven Warrior, a Lich Healer, a Phantom Rogue, or a Cyclops Mage. You'd better get productive to earn enough gold before your time runs out...</p>
        <div class="small mb-3">by gawrone, jjgame83, AnnDeLune, Beffymaroo, and SabreCat</div>
        <div class="promo_fall_festival_2018 center-block"></div>
        <h3>Seasonal Shop Opens</h3>
        <p>The <a href='/shops/seasonal'>Seasonal Shop</a> has opened! It's stocking autumnal Seasonal Edition goodies at the moment, including past fall outfits. Everything there will be available to purchase during the Fall Festival event each year, but it's only open until October 31st, so be sure to stock up now, or you'll have to wait a year to buy these items again!</p>
        <div class="small mb-3">by AnnDeLune, ʂʈєƒąʃųƥągųʂ, Katy133, Lilith of Alfheim, Definitely not a villain, ShoGirlGeek. cataclysms, maxpendragon, Vikte, QuartzFox, Lemoness, Beffymaroo and SabreCat</div>
        <div class="promo_seasonal_shop_fall center-block"></div>
        <h3>NPC Outfits</h3>
        <p>Everyone has hastened down to the Flourishing Fields to celebrate this spooky autumn festival. Be sure to check out all the outfits that people are sporting!</p>
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
