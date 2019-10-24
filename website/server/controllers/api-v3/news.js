import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'OCTOBER SUBSCRIBER ITEMS AND BLOG POSTS!';
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
            <h2>10/24/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201910 center-block"></div>
        <h3>October Subscriber Items Revealed!</h3>
        <p>The October Subscriber Item has been revealed: the Cryptic Flame Item Set! You only have until October 31 to <a href='/user/settings/subscription'>receive the item set when you subscribe</a>. If you're already an active subscriber, reload the site and then head to Inventory > Items to claim your gear!</p>
        <p>Subscribers also receive the ability to buy Gems for Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="scene_arts_crafts center-block"></div>
        <h3>Use Case Spotlight: Habitica Events!</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/10/24/use-case-spotlight-using-habitican-events-for-motivation/' target='_blank'>Use Case Spotlight</a> is about Using Habitica Events for Motivation! It features a number of great suggestions submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6'>Use Case Spotlights Guild</a>. We hope it helps any of you who might be looking for new ways to incentivize yourselves.</p>
        <p>Plus, we're collecting user submissions for the next spotlight! How do you gamify your tasks? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by shanaqui</div>
        <h3>Guild Spotlight: More New and Notable Guilds!</h3>
        <p>There's a new <a href='https://habitica.wordpress.com/2019/10/24/new-and-notable-guild-spotlight-10/' target='_blank'>Guild Spotlight on the blog</a> that highlights yet another selection of the upcoming Guilds in Habitica dedicated to a variety of topics! Check it out now to find some of Habitica's best new communities.</p>
        <div class="small mb-3">by shanaqui</div>
        <div class="promo_seasonal_shop_fall center-block"></div>
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
