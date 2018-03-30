import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR SUBSCRIBER ITEMS, MAGIC POTIONS AVAILABLE INTO APRIL, AND COMMUNITY GUIDELINES UPDATES';
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
        <h2>3/29/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="promo_rainbow_potions mr-3 mb-3"></div>
          <div class="media-body">
            <div class="media align-items-center">
              <div class="media-body">
                <h3>Last Chance for Daring Dragonfly Set</h3>
                <p>Reminder: this is the final day to <a href='/user/settings/subscription' target='_blank'>subscribe</a> and receive the Daring Dragonfly Set! Subscribing also lets you buy gems for gold. The longer your subscription, the more gems you get!</p>
                <p>Thanks so much for your support! You help keep Habitica running.</p>
                <div class="small mb-3">by Beffymaroo</div>
              </div>
              <div class="promo_mystery_201803"></div>
            </div>
            <h3>Extended Availability for Shimmer and Rainbow Hatching Potions</h3>
            <p>Due to popular demand, we've extended the availability of the Rainbow and Shimmer Magic Hatching Potions until Spring Fling ends on April 30! Be sure to grab them from the <a href='/shops/market' target='_blank'>Market</a> before then! If they come back, it won't be until next year at the earliest, so don't delay!</p>
            <div class="small mb-3">by Beffymaroo, Teto Forever, tricksy.fox, and SabreCat</div>
          </div>
        </div>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Community Guidelines Updates</h3>
            <p>We've made some important updates to <a href='/static/community-guidelines' target='_blank'>the Community Guidelines</a> to make it easier to read, as well as to clarify some policies on subjects such as promotional Challenges, spamming, and more. <a href='/static/community-guidelines' target='_blank'>Be sure to read it</a> before you chat in the <a href='/groups/tavern' target='_blank'>Tavern</a>, in <a href='/groups/discovery' target='_blank'>Guilds</a>, or in your <a href='/party' target='_blank'>Party</a>!</p>
            <p>Thanks for helping us keep Habitica's community happy and safe!</p>
            <div class="small mb-3">by shanaqui and the marvelous moderators</div>
          </div>
          <div class="community_guidelines"></div>
        </div>
        <h3>Moderator Contact Form</h3>
        <p>Encountering a community issue? There's a new, simple way to get in touch with the moderator team: <a href='http://contact.habitica.com' target='_blank'>the moderator contact form</a>! You can access it under the Help menu, under the Helpful Links in the <a href='/groups/tavern' target='_blank'>Tavern</a> sidebar, or on <a href='/static/contact' target='_blank'>the Contact Us page</a>. This is always the best and fastest way to contact a moderator if you need help. We hope that it will be useful!</p>
        <div class="small mb-3">by TheHollidayInn, Lemoness, and Alys</p>
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
