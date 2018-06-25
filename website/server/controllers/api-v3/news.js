import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'USE CASE SPOTLIGHT AND GUILD SPOTLIGHT ON PARENTING AND FAMILY LIFE, PLUS NEW BEHIND THE SCENES POST!';
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
            <h2>6/22/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <p>We've got new posts on the blog all about ways to use Habitica to help with parenting and family-related matters! First, there's a <a href='https://habitica.wordpress.com/2018/06/14/guilds-for-parenting-and-family-life/' target='_blank'>Guild Spotlight</a> that highlights the Guilds that can help you as you explore ways to use Habitica to smooth your home and family life. We've also posted a <a href='https://habitica.wordpress.com/2018/06/14/use-case-spotlight-parenting-and-family-life/' target='blank'>Use Case Spotlight</a> featuring a number of great suggestions for using Habitica's task system to manage parenting and family-related tasks! These suggestions were submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6' target='_blank'>Use Case Spotlights Guild</a>.</p>
          </div>
          <div class="scene_families ml-3 mb-3"></div>
        </div>
        <div class="media align-items-center">
          <div class="scene_moderators mr-3 mb-3"></div>
          <div class="media-body">
            <p>Plus, we're collecting user submissions for the next Use Case Spotlight! How do you use Habitica to build a routine to challenge your brain and keep your mind sharp? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
            <p>There's also a new <a href='https://habitica.wordpress.com/2018/06/21/behind-the-scenes-weird-tales-of-the-mod-slack/' target='_blank'>Behind the Scenes post</a> on the Habitica blog about fun facts and goofy shenanigans from the Moderator Team and their behind-the-scenes chat channel. Check it out!</p>
            <div class="small mb-3">by Beffymaroo, the Habitica Staff, and the Moderator Team</div>
          </div>
        </div>
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
