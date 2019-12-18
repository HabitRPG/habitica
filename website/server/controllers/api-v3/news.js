import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'GIFT ONE, GET ONE PROMOTION! AND BLOG POST ON RUNNING CHALLENGES';
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
            <h2>12/17/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_g1g1_2019 center-block"></div>
        <h3>Gift a Subscription and Get One Free!</h3>
        <p>
          In honor of the season of giving--and due to popular demand!--we're bringing back a very
          special promotion from now until January 6. Now when you gift somebody a subscription,
          you get the same subscription for yourself for free!
        </p>
        <p>
          Subscribers get tons of perks every month, including exclusive equipment, the ability to
          buy Gems with Gold, a special Jackalope Pet, and increased data history. Plus, it helps
          keep Habitica running :)
        </p>
        <p>
          To gift a subscription to someone on our mobile apps, just go to Menu and tap the Gift
          One Get One banner. On web, just open their profile and click the present icon in the
          upper right. You can open their profile by clicking their avatar in your party header or
          their name in chat.
        </p>
        <p>
          Please note that this promotion only applies when you gift to another Habitican. If you
          or your gift recipient already have a recurring subscription, the gifted subscription
          will only start after that subscription is cancelled or has expired.
        </p>
        <p>Thanks so much for your support! <3</p>
        <div class="scene_todos center-block"></div>
        <h3>Blog Post: Running a Challenge</h3>
        <p>
          This month's <a href="https://habitica.wordpress.com/2019/12/11/running-a-challenge/"
          target="_blank">featured Wiki article</a> is about Running a Challenge! We hope that it
          will help you as look for exciting ways to motivate yourself and others. Be sure to check
          it out, and let us know what you think by reaching out on <a
          href="https://twitter.com/habitica" target="_blank">Twitter</a>, <a
          href="http://blog.habitrpg.com" target="_blank">Tumblr</a>, and <a
          href='https://facebook.com/habitica' target="_blank">Facebook</a>.
        </p>
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
    const { user } = res.locals;

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => n && n.type === 'NEW_STUFF');
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

export default api;
