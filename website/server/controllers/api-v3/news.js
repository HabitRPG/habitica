import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'BLOG: USING HABITICA TO MAKE A DIFFERENCE, AND VIDEO GAMES BEHIND THE SCENES!';
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
        <h2>4/19/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="scene_positivity center-block"></div>
        <h3>Use Case Spotlight: Making a Difference</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2018/04/12/use-case-spotlight-making-a-difference/' target='_blank'>Use Case Spotlight</a> is about Making a Difference! It features a number of great suggestions submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6' target='_blank'>Use Case Spotlights Guild</a>. We hope it helps any of you who might be working to make a positive difference!</p>
        <p>Plus, we're collecting user submissions for the next spotlight! How do you use Habitica to manage your Mental Health and Wellness? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Behind the Scenes: What We're Playing</h3>
            <p>Like many of you Habiticans out there, our team loves video and mobile games, and in this special post we wanted to share what we're currently playing (besides Habitica, of course!) and what we love about these games.  Come check them out in <a href='https://habitica.wordpress.com/2018/04/19/behind-the-scenes-what-were-playing/' target='_blank'>this month's Behind the Scenes feature</a>!</p>
            <div class="small mb-3">by Beffymaroo and the Habitica Staff</div>
          </div>
          <div class="scene_video_games ml-3"></div>
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
