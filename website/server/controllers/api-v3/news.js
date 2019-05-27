import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'BLOG POSTS: WIKI AND USE CASE SPOTLIGHTS!';
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
            <h2>5/23/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="scene_rewards center-block"></div>
        <h3>Blog Post: Enchanted Armoire</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/05/22/enchanted-armoire/' target='_blank'>featured Wiki article</a> is about the Enchanted Armoire! We hope that it will help you as you reward yourself for your accomplishments. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
        <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
        <div class="scene_gold center-block"></div>
        <h3>Use Case Spotlight: Invigorating the Endgame</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/05/23/use-case-spotlight-keeping-things-interesting-in-endgame/' target='_blank'>Use Case Spotlight</a> is about Keeping Things Interesting in Habitica's "Endgame"! It features a number of great suggestions submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6'>Use Case Spotlights Guild</a>. We hope it helps any of you who might be longtime Habiticans looking to keep things fresh.</p>
        <p>Plus, we're collecting user submissions for the next spotlight! We want to hear your best tricks and strategies for playing the Warrior class to its full advantage. We’ll be featuring player-submitted tips in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
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
