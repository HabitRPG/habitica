import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW STEAMPUNK BACKGROUNDS FROM THE TIME TRAVELERS!';
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
            <h2>1/21/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="d-flex justify-content-center mb-3">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/background_steamworks_demo.gif" />
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/background_clocktower_demo.gif" />
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/background_airship_demo.gif" />
        </div>
        <p>
          Hello Habiticans! We've released brand-new backgrounds in the Time Travelers' shop! Show
          off your retrofuturistic outfits at the Clocktower, Steamworks, and even in an Airship!
          These will be available at the cost of one <a
          href='https://habitica.fandom.com/wiki/Mystic_Hourglass' target='_blank'>Mystic
          Hourglass</a> each.
        </p>
        <p>
          Check out the <a href='/shops/time'>Time Travelers' shop</a> to find these cool
          backgrounds, as well as past subscriber gear, the Robot pet quest, and even rare pets and
          mounts!
        </p>
        <p>Thanks for supporting Habitica! We hope that you enjoy your new backgrounds.</p>
        <div class="small mb-3">by gawrone, annetiger, SabreCat, and Viirus</div>
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
