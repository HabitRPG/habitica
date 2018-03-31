import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA ON INSTAGRAM, SELF-IMPOSED CHALLENGE BLOG, AND WHAT\'S THE APRIL FOOL UP TO?';
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
        <h2>3/30/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <h3>Habitica is Now on Instagram!</h3>
        <p>Habitica's <a href='https://www.instagram.com/habitica' target='_blank'>Instagram</a> is now live! Follow us for updates and exclusive peeks at behind-the-scenes fun!</p>
        <div class="media align-items-center">
          <div class="scene_todos"></div>
          <div class="media-body">
            <h3>New Blog Post: Self-Imposed Challenges!</h3>
            <p>This month's <a href='https://habitica.wordpress.com/2018/03/28/self-imposed-challenges/' target='_blank'>featured Wiki article</a> is about Self-Imposed Challenges! We hope that it will help you as you customize Habitica to make it as fun and challenging as you'd like it to be! Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
            <div class="small mb-3">by Beffymaroo and the Wiki Wizards</div>
          </div>
        </div>
        <h3>The April Fool Stops By the Tavern...</h3>
        <p>It's that time of year again, and all Habitica's denizens have been on the lookout for stirrings from the most mischievous Masterclasser: the April Fool. Puzzlingly (and perhaps alarmingly!) he's been unusually quiet considering his favorite day is nearing. He's announced he's keeping his plans small-scale and that they will hardly be noticed, but upon hearing this from Tavern-goers on a visit to Habit City, Lady Glaciate rolled her eyes.</p>
        <p>"I'd be interested to know what the Master of Rogues considers a modestly-proportioned prank…" she says irritably.</p>
        <p>Perhaps you should check back over the weekend to see what's in store…</p>
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
