import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA BLOG POSTS: NEW GUILDS AND GAMIFYING TASKS';
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
            <h2>11/19/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="scene_yarn_boss center-block"></div>
        <h3>Guild Spotlight: New and Notable Guilds for November!</h3>
        <p>
          There's a new <a
          href='https://habitica.wordpress.com/2019/11/19/new-and-notable-guild-spotlight-11/'
          target='_blank'>Guild Spotlight on the blog</a> that highlights yet another selection
          of the upcoming Guilds in Habitica dedicated to a variety of topics! Check it out now to
          find some of Habitica's best new communities.
        </p>
        <div class="small mb-3">by shanaqui</div>
        <div class="scene_office center-block"></div>
        <h3>Use Case Spotlight: Gamifying Your Tasks</h3>
        <p>
          This month's <a
          href='https://habitica.wordpress.com/2019/11/19/use-case-spotlight-gamifying-your-tasks/'
          target='_blank'>Use Case Spotlight</a> is about Gamifying Your Tasks! It features a
          number of great suggestions submitted by Habiticans in the <a
          href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6'>Use Case Spotlights Guild</a>.
          We hope it helps any of you who might be looking for ways to add more fun and adventure
          to your tasks.
        </p>
        <p>
          Plus, we're collecting user submissions for the next spotlight! How do you use
          Habitica's social spaces to help motivate yourself? We’ll be featuring player-submitted
          examples in Use Case Spotlights on the Habitica Blog next month, so post your
          suggestions in the Use Case Spotlight Guild now. We look forward to learning more about
          how you use Habitica to improve your life and get things done!
        </p>
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
