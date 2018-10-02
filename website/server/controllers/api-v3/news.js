import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SLEEPY AVATARS; LAST CHANCE FOR AUTUMNAL ARMOR SET AND FOREST FRIENDS BUNDLE';
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
            <h2>9/27/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>Is Your Avatar Asleep?</h3>
        <p>Hey Habiticans! You may have noticed we experienced a server outage on 25-September. During this issue, we <a href='https://habitica.wikia.com/wiki/Rest_in_the_Inn' target='_blank'>put all users in the Inn</a> to prevent any unfair damage. To check out of the Inn and resume damage from Dailies as well as boss damage in Quests, go to Menu>Social>Tavern>Details (on mobile) or Guilds>Tavern (on web) and tap the orange banner that says "Resume Damage."</p>
        <p>Thank you all for your patience and support during the outage. We are always grateful for our exceptionally wonderful community! <3</p>
        <div class="promo_mystery_201809 center-block"></div>
        <h3>Last Chance for Autumnal Armor Set</h3>
        <p>Reminder: this weekend is your last chance to <a href='/user/settings/subscription' target='_blank'>subscribe</a> and receive the Autumnal Set! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_forest_friends_bundle center-block"></div>
        <h3>Last Chance for Forest Friends Quest Bundle</h3>
        <p>This is also the final week to buy the discounted Forest Friends Pet Quest Bundle, featuring the Deer, Hedgehog, and Treeling quests all for seven Gems! Be sure to grab this bundle from the <a href='/shops/quests' target='_blank'>Quest Shop</a> before it scampers into the underbrush!</p>
        <p>After they're gone, it will be at least a year before the Ghost or Glow-in-the-Dark Hatching Potions are available again, so be sure to get them now!</p>
        <div class="small">by Beffymaroo and SabreCat</div>
        <div class="small">Art by Uncommon Criminal, InspectorCaracal, Leephon, aurakami, FuzzyTrees, PainterProphet, and plumilla</div>
        <h3>Blog Post: Contributing to Habitica</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2018/09/19/contributing-to-habitica/' target='_blank'>featured Wiki article</a> is about Contributing to Habitica. We hope that it will help you get involved with our open-source project and our great community! Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
        <div class="small mb-3">Writing by Daniel the Bard, Flutter Bee, and Lemoness</div>
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
