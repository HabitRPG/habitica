import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW PET QUEST BADGE AND BLOG POST!';
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
            <h2>3/17/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="achievement-bugBonanza2x center-block"></div>
        <h3>New Pet Quest Badge!</h3>
        <p>
          We're releasing a new achievement so you can celebrate your successes in the world of
          Habitican Pet collecting! Earn the Bug Bonanza achievement by collecting all Habitica's
          insect and insect-adjacent Pets and you'll earn a nifty badge for your profile.
        </p>
        <p>
          If you’ve already completed the required Quests for a newly released achievement you
          don’t have to do them all again! Just complete one of the relevant Quests and the
          Achievement will unlock. Check your profile and celebrate your new Achievement with
          pride.
        </p>
        <div class="small mb-3">by JokeRat and SabreCat</div>
        <div class="promo_cosplay center-block"></div>
        <h3>Blog Post: Cosplay</h3>
        <p>
          This month's <a href='https://habitica.wordpress.com/2020/03/11/cosplay/'
          target='_blank'>featured Wiki article</a> is about doing Cosplay with your avatar! We
          hope that it will help you as you explore more ways to have fun with the stash of
          outfits, pets, and backgrounds you've earned by completing your tasks. Be sure to check
          it out, and let us know what you think by reaching out on <a
          href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a
          href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a
          href='https://facebook.com/habitica' target='_blank'>Facebook</a>.
        </p>
        <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
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
