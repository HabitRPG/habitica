import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SUMMER SPLASH BEGINS: SUMMER CLASS OUTFITS, SEASONAL SHOP, AND NPC DECORATIONS!';
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
        <h2>6/19/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <p>To escape the summer heat in Habit City, everyone's moved down to the undersea city of Dilatory. The Summer Splash event has begun!</p>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Summer Class Outfits</h3>
            <p>From now until July 31st, limited edition outfits are available in the Rewards column. Depending on your class, you can be a Lionfish Mage, Fisher-Rogue, Betta Fish Warrior, or Merfolk Monarch Healer! You'd better get productive to earn enough gold before they disappear. Good luck!</p>
            <div class="small mb-3">by Vampitch, Vikte, TheDudeAbides, Lalaitha, and Beffymaroo</div>
            <div class="media align-items-center">
              <div class="promo_seasonal_shop_summer mr-3"></div>
              <div class="media-body">
                <h3>Seasonal Shop is Open!</h3>
                <p>The <a href='/shops/seasonal' target='_blank'>Seasonal Shop</a> has opened! The Seasonal Sorceress is stocking the seasonal edition versions of previous summer outfits, now available for Gems instead of Gold. Plus, there will be more fun things in the shop as the event progresses. The Seasonal Shop will only be open until July 31st, so don't wait!</p>
                <div class="small mb-3">by SabreCat, Lemoness, AnnDeLune, Vampitch, nonight, tricksy.fox, Giu09, JaizakAripaik, Teto Forever, and Kai</div>
              </div>
            </div>
            <div class="media align-items-center">
              <div class="media-body">
                <h3>NPC Costumes and Shop Decorations</h3>
                <p>Looks like the NPCs are really getting in to the cheery summer mood around the site. Who wouldn't? After all, there's plenty more celebration to come...</p>
                <div class="small mb-3">by Lemoness and Beffymaroo</div>
              </div>
              <div class="npc_matt ml-3 mb-3"></div>
            </div>
          </div>
          <div class="promo_summer_splash_2018 ml-3"></div>
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
