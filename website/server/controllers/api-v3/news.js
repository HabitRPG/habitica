import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW FEEDBACK FORM! PLUS GUILD AND USE CASE SPOTLIGHTS';
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
            <h2>5/21/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>New Feedback and Feature Request Form</h3>
        <p>
          Great news, Habiticans! We've made it easier for you to send us your feedback about
          improving the site and apps. We're transitioning from our existing feedback Trello board
          to an <a href='https://docs.google.com/forms/d/e/1FAIpQLScPhrwq_7P1C6PTrI3lbvTsvqGyTNnGzp1ugi1Ml0PFee_p5g/viewform?usp=sf_link'
          target='_blank'>easy-to-use Google form</a>.
        </p>
        <p>
          This will make it simpler for you to tell us your thoughts and ideas, while also making
          it simpler for the Habitica team to view, analyze, and take action on what the community
          wants and needs. We hope you enjoy the change!
        </p>
        <p>
          The new <a href='https://docs.google.com/forms/d/e/1FAIpQLScPhrwq_7P1C6PTrI3lbvTsvqGyTNnGzp1ugi1Ml0PFee_p5g/viewform?usp=sf_link'
          target='_blank'>Google form</a> is already live and you can add your comments to it now
          via that link. The link will also be directly available via the Send Feedback menu option
          in the mobile apps in our next updates.
        </p>
        <p>
          Our existing feedback <a href='https://trello.com/b/EpoYEYod/habitica'
          target='_blank'>Trello board</a> will remain public and open for comments until May 28.
          After May 28 it will be archived so the Habitica team can still refer to past comments.
        </p>
        <div class="small mb-3">by The Habitica Team</div>
        <div class="scene_vikte center-block"></div>
        <h3>Guild Spotlight: Vikte's Favorites</h3>
        <p>
          For this year's Guild Spotlight series, we're highlighting some favorites from
          Habitica's staff, moderators, and some high-level contributors!
        </p>
        <p>
          This month we're sharing some <a
          href='https://habitica.wordpress.com/2020/05/21/guild-spotlights-our-favourites-4/'
          target='_blank'>picks from longtime artisan Vikte</a>! If you want to curate your
          Habitica experience and join active, positive Guilds, this is a great way to pick up some
          new ideas for Guilds to join.
        </p>
        <div class="small mb-3">by shanaqui</div>
        <div class="scene_todos center-block"></div>
        <h3>Use Case Spotlight: Managing Your Biggest Projects</h3>
        <p>
          This month's <a href='https://habitica.wordpress.com/2020/05/21/use-case-spotlight-managing-your-biggest-projects/'
          target='_blank'>Use Case Spotlight</a> is about Managing Your Biggest Projects! It
          features a number of great suggestions submitted by Habiticans in the <a
          href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6'>Use Case Spotlights Guild</a>.
          We hope it helps any of you who might have a long-term, complex, or intense project
          coming up in your life.
        </p>
        <p>
          Plus, we're collecting user submissions for the next spotlight! How do you use Habitica
          to Adapt to Life Changes? We’ll be featuring player-submitted examples in Use Case
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
