import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'FEBRUARY SUBSCRIBER MYSTERY ITEMS! PLUS USE CASE SPOTLIGHT';
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
            <h2>2/25/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201902 center-block"></div>
        <h3>February Subscriber Items Revealed!</h3>
        <p>The February Subscriber Items have been revealed: the Cryptic Crush Item Set! You only have four days to receive the item set when you <a href='/user/settings/subscription'>subscribe</a>. If you're already an active subscriber, reload the site and then head to Inventory > Items to claim your gear!</p>
        <p>Subscribers also receive the ability to buy Gems with Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="scene_cooking center-block"></div>
        <h3>Use Case Spotlight: Household Task Sharing</h3>
        <p>We've posted a new <a href='https://habitica.wordpress.com/2019/02/21/use-case-spotlight-sharing-household-tasks/' target='_blank'>Use Case Spotlight</a> on the Habitica blog! It features a number of great suggestions for using Habitica's task system to manage sharing domestic chores. These suggestions were submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6' target='_blank'>Use Case Spotlights Guild</a>.</p>
        <p>Plus, we're collecting user submissions for the next Use Case Spotlight! How do you use Habitica to set up routines? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
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
