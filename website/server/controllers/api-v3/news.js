import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SUBSCRIPTION GIFTING ON ANDROID AND WIKI SPOTLIGHT';
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
            <h2>1/11/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_g1g1 center-block"></div>
        <h3>Subscription Gifting Available on Android!</h3>
        <p>Hey everyone! We've added the ability to give gift subscriptions using our Android app. Go to Menu > Gems and Subscriptions and tap "Gift a Subscription" in the Subscriptions tab.</p>
        <p>Subscribers receive lots of fun perks, such as exclusive gear, the ability to buy Gems with Gold, and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running.</p>
        <p>There are a few days left of our Gift-One-Get-One promotion, so this is a great time to check out this new Android feature!  Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Viirus and Piyo</div>
        <div class="scene_starting_over center-block"></div>
        <h3>Blog Post: the Orb of Rebirth</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/01/09/orb-of-rebirth/' target='_blank'>featured Wiki article</a> is about the Orb of Rebirth! We hope that it will help you as turn over a new leaf for 2019. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
        <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
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
