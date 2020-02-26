import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'BLOG POSTS: PARTY PARTICIPATION AND OUR FAVO(U)RITE GUILDS!';
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
            <h2>2/20/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="scene_gaining_achievement center-block"></div>
        <h3>Use Case Spotlight: Party Participation</h3>
        <p>
          This month's <a
          href='https://habitica.wordpress.com/2020/02/20/use-case-spotlight-party-cipation/'
          target='_blank'>Use Case Spotlight</a> is about Party Participation! It features a number
          of great suggestions submitted by Habiticans in the <a
          href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6'>Use Case Spotlights Guild</a>.
          We hope it helps any of you who might be looking for ways to keep your quest party
          engaged and excited to win battles with good habits.
        </p>
        <p>
          Plus, we're collecting user submissions for the next spotlight! How do you use Habitica
          to manage conflicting needs, like productivity versus self-care? We’ll be featuring
          player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post
          your suggestions in the Use Case Spotlight Guild now. We look forward to learning more
          about how you use Habitica to improve your life and get things done!
        </p>
        <div class="small mb-3">by shanaqui</div>
        <div class="scene_shanaqui center-block"></div>
        <h3>Guild Spotlight: Shanaqui's Favourites</h3>
        <p>
          For this year's Guild Spotlight series, we're highlighting some favourites from
          Habitica's staff, moderators, and maybe some high-level contributors!
        </p>
        <p>
          This month we're kicking things off with some <a
          href='https://habitica.wordpress.com/2020/02/20/guild-spotlights-our-favourites/'
          target='_blank'>picks from shanaqui!</a> If you want to curate your Habitica experience
          and join active, positive Guilds, this is a great way to pick up some new ideas for
          Guilds to join.
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
