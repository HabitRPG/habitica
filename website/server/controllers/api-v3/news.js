import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'BLOG POSTS: GUILD SPOTLIGHT AND USE CASE SPOTLIGHT!';
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
            <h2>3/24/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="scene_QuartzFox center-block"></div>
        <h3>Guild Spotlight: QuartzFox's Favorites!</h3>
        <p>
          There's a new <a
          href='https://habitica.wordpress.com/2020/03/26/guild-spotlights-our-favourites-2/'
          target='_blank'>Guild Spotlight on the blog</a> featuring the favorite Guilds of Habitica
          contributor @QuartzFox! Check it out now to find Guilds that have helped her and which
          you might appreciate as well!
        </p>
        <div class="small mb-3">by shanaqui and QuartzFox</div>
        <div class="scene_tough_times center-block"></div>
        <h3>Use Case Spotlight: Managing Conflicting Needs</h3>
        <p>
          This month's <a href='https://habitica.wordpress.com/2020/03/26/use-case-spotlight-managing-conflicting-goals-and-needs/'
          target='_blank'>Use Case Spotlight</a> is about Managing Conflicting Needs! It features a
          number of great suggestions submitted by Habiticans in the <a
          href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6'>Use Case Spotlights Guild</a>.
          We hope it helps any of you who might be looking to balance different task types in your life.
        </p>
        <p>
          Plus, we're collecting user submissions for the next spotlight! How do you use Habitica
          to Manage Long-Term Conditions? We’ll be featuring player-submitted examples in Use Case
          Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case
          Spotlight Guild now. We look forward to learning more about how you use Habitica to
          improve your life and get things done! 
        </p>
        <div class="small mb-3">by shanaqui</div>
      </div>
      `,
    });
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Allow latest Bailey announcement to be read later
 * @apiName TellMeLaterNews
 * @apiDescription Add a notification to allow viewing of the latest "New Stuff by Bailey" message.
 * Prevent this specific Bailey message from appearing automatically.
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
