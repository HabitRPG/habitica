import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA BIRTHDAY PARTY!';
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
            <h2>1/31/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_birthday_2019 center-block"></div>
        <h3>Habitica Birthday Bash!</h3>
        <p>January 31st is Habitica's Birthday! Thank you so much for being a part of our community - it means a lot.</p>
        <p>Now come join us and the NPCs as we celebrate!</p>
        <h3>Cake for Everybody!</h3>
        <p>In honor of the festivities, everyone has been awarded an assortment of yummy cake to feed to your pets! Plus, for the next two days <a href='/shops/market'>Alexander the Merchant</a> is selling cake in his shop, and cake will sometimes drop when you complete your tasks. Cake works just like normal pet food, but if you want to know what type of pet likes each slice, <a href='http://habitica.wikia.com/wiki/Food' target='_blank'>the wiki has spoilers</a>.</p>
        <h3>Party Robes</h3>
        <p>There are Party Robes available for free in the Rewards column! What color you receive is based on how many Habitica Birthdays you've celebrated. Don them with pride!</p>
        <h3>Birthday Bash Achievement</h3>
        <p>In honor of Habitica's birthday, everyone has been awarded the Habitica Birthday Bash achievement! This achievement stacks for each Birthday Bash you celebrate with us.</p>
        <div class="promo_mystery_201901 center-block"></div>
        <h3>Last Chance for Polaris Set</h3>
        <p>Reminder: tomorrow is the final day to <a href='/user/settings/subscription'>subscribe</a> and receive the Polaris Armor Set! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_snow_potions center-block"></div>
        <h3>Last Chance for Winter Wonderland Hatching Potions</h3>
        <p>Reminder: tomorrow is the final day to <a href='/shops/market'>buy Starry Night, Peppermint, and Icy Snow Hatching Potions</a>! If they come back, it won't be until next year at the earliest, so don't delay!</p>
        <div class="small mb-3">by JinjooHat, Vampitch, Lemoness, and SabreCat</div>
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
