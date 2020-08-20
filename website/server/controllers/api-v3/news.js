import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW PET COLLECTION BADGES!';
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
            <h2>8/18/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_golden_achievements center-block"></div>
        <p>
          We're releasing a new achievement so you can celebrate your successes in the world of
          Habitican pet collecting! Earn the Good as Gold and All That Glitters achievements by
          collecting Golden pets and mounts and you'll earn a nifty badge for your profile.
        </p>
        <p>
          If you already have all the Golden pets and/or mounts in your stable, you'll receive the
          badge automatically! Check your profile and celebrate your new achievement with pride.
        </p>
        <div class="small mb-3">by Jokerat and SabreCat</div>
        <h3>Task Scoring and Notification Improvements!</h3>
        <p>
          We've made an improvement to scoring your tasks via the Record Yesterday's Activity tool
          on web! Previously, you'd see your stats increase as you checked things off in that
          modal. Once the change goes live, you'll only see your stats increase and get
          notifications about rewards and damage once you click to start a new day. You'll also
          receive reduced popups with totals in stats gained rather than individual stat changes.
          We hope you enjoy this change!
        </p>
        <div class="small mb-3">by paglias, negue, and Apollo</div>
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
