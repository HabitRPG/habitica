import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'EGG QUEST IN THE SEASONAL SHOP! AND HELPFUL RESOURCES FOR TOUGH TIMES';
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
        <div class="promo_egg_quest center-block"></div>
        <h3>Egg Quest Available</h3>
        <p>
          The Egg Quest is available again in the <a href='/shops/seasonal'>Seasonal Shop</a>!
          Strange eggs are appearing all over Habitica. Can you collect them all to earn some
          colorful Egg pets and mounts?
        </p>
        <div class="small mb-3">by Megan, Beffymaroo, and Lemoness</div>
        <div class="scene_tough_times center-block"></div>
        <h3>Blog Post: Helpful Resources for Tough Times</h3>
        <p>
          Hey Habiticans! We hope you're all staying safe and well during this stressful time.
          We've put together some <a
          href='https://habitica.wordpress.com/2020/03/20/helpful-resources-for-tough-times/'
          target='_blank'>resources on the Habitica blog</a> for help with maintaining health and
          wellness, setting up or changing a routine, and more! Take care, we love y'all.
        </p>
        <div class="small mb-3">by the Habitica Team</div>
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
