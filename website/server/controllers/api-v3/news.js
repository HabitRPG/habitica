import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'WINTER WONDERLAND BEGINS! AND DECEMBER MYSTERY ITEMS REVEALED';
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
            <h2>12/20/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_winter_wonderland_2019 center-block"></div>
        <h3>Winter Wonderland Begins!</h3>
        <p>A wintery breeze is blowing in from the Stoïkalm Steppes, and the snow is gently drifting down over Habit City. The Winter Wonderland event has begun!</p>
        <h3>Winter Class Outfits</h3>
        <p>From now until January 31st, limited edition outfits are available in the Rewards column. Depending on your class, you can be a Blizzard Warrior, a Poinsettia Rogue, a Pyrotechnic Mage, or a Winter Star Healer! You'd better get productive to earn enough gold before they disappear. Good luck!</p>
        <div class="small mb-3">by Lt Cabel, Vikte, AnnDeLune, Persephone, SabreCat, shanaqui, and Beffymaroo</div>
        <div class="promo_seasonal_shop center-block"></div>
        <h3>Seasonal Shop is Open!</h3>
        <p>The <a href='/shops/seasonal'>Seasonal Shop</a> has opened! The Seasonal Sorceress is stocking the seasonal edition versions of previous winter outfits, now available for gems instead of gold, and the two winter quests, Trapper Santa and Find the Cub. Plus, there will be more fun things in the shop as the event progresses.The Seasonal Shop will only be open until January 31st, so don't wait!</p>
        <div class="small mb-3">by SabreCat and Lemoness</div>
        <div class="promo_npc_alex center-block"></div>
        <h3>NPC Costumes</h3>
        <p>Looks like the NPCs are really getting in to the cheery winter mood around the site. Who wouldn't? After all, there's plenty more celebration to come...</p>
        <div class="small mb-3">by Lemoness</div>
        <div class="promo_mystery_201812 center-block"></div>
        <h3>December Subscriber Items Revealed!</h3>
        <p>The December Subscriber Set has been revealed: the Arctic Fox Item Set! You only have until December 31 to <a href='/user/settings/subscription'>receive the item set when you subscribe</a>. If you're already an active subscriber, reload the site and then head to Inventory > Items to claim your gear!</p>
        <p>Subscribers also receive the ability to buy Gems with Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Beffymaroo</div>
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
