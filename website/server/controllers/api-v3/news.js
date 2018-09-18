import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'USE CASE SPOTLIGHT AND GUILD SPOTLIGHT ON HANDS-ON SKILLS';
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
            <h2>9/18/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <p>We've got new posts on the blog all about ways to use Habitica to help with Hands-on and Practical Skills! First, there's a <a href='https://habitica.wordpress.com/2018/09/18/getting-hands-on-guilds-for-practical-skills/' target='_blank'>Guild Spotlight</a> that highlights the Guilds that can help you as you explore ways to use Habitica to help with hands-on projects. We've also posted a <a href='https://habitica.wordpress.com/2018/09/18/use-case-spotlight-hands-on-and-practical-skills/' target='_blank'>Use Case Spotlight</a> featuring a number of great suggestions for using Habitica's task system to manage these kinds of tasks as well! These suggestions were submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6' target='_blank'>Use Case Spotlights Guild</a>.</p>
        <p>Plus, we're collecting user submissions for the next Use Case Spotlight! How do you use Habitica to celebrate yourself and your accomplishments? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by shanaqui</div>
        <div class="scene_tools center-block"></div>
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
  middlewares: [authWithHeaders({
    userFieldsToExclude: ['inbox'],
  })],
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
