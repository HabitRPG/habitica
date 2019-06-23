import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'JULY SUBSCRIBER ITEMS AND HABITICA BLOG POSTS';
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
            <h2>7/25/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201907 center-block"></div>
        <h3>July Subscriber Items Revealed!</h3>
        <p>The July Subscriber Items have been revealed: the extra-special 3-piece Beach Buddy Item Set! You only have until July 31 to receive the item set <a href='/user/settings/subscription'>when you subscribe</a>.</p>
        <p>If you're already an active subscriber, reload the site or app and then head to Inventory > Items to claim your gear!</p>
        <p>Subscribers also receive the ability to buy Gems for Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="scene_casting_spells center-block"></div>
        <h3>Blog Posts: Healer</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/07/17/healer/' target='_blank'>featured Wiki article</a> and <a href='https://habitica.wordpress.com/2019/07/25/use-case-spotlight-making-the-most-of-the-healer-class/' target='_blank'>Use Case Spotlight</a> are about the Healer Class! We hope that they will help you as you choose the best class for your Habitica play style. Be sure to check them out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
        <p>Plus, we're collecting user submissions for the next spotlight! We want to hear your best tricks and strategies for playing the Rogue class to its full advantage. We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
        <div class="scene_tools center-block"></div>
        <h3>Guild Spotlight: More New and Notable Guilds!</h3>
        <p>There's a new <a href='https://habitica.wordpress.com/2019/07/25/new-and-notable-guild-spotlight-7/' target='_blank'>Guild Spotlight on the blog</a> that highlights more of the upcoming Guilds in Habitica dedicated to a variety of topics! Check it out now to find some of Habitica's best new communities.</p>
        <div class="small mb-3">by shanaqui</div>
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
