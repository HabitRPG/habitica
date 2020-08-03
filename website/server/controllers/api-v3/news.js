import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA’S NAMING DAY!';
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
            <h2>7/31/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="achievement-habiticaDay2x center-block"></div>
        <h3>Habitica Naming Day</h3>
        <p>
          Happy Habitica Naming day! In honor of the day when we changed the name of the app from
          HabitRPG to Habitica, we've given everyone an achievement, as well as some delicious cake
          for your pets and mounts.
        </p>
        <div class="small mb-3">by Lemoness and SabreCat</div>
        <div class="promo_naming_day_2020 center-block"></div>
        <h3>Habitica Purple Gryphons</h3>
        <p>
          Speaking of pets and mounts, we've given all users Royal Purple Gryphon rewards!
          Depending on how many Naming Days you've celebrated with us, you've received Melior (a
          Purple Gryphon mount), his little sister Meliora (a Purple Gryphon pet), a Purple Gryphon
          Helm, the Purple Gryphon Wing Cloak, or the latest addition, the Purple Gryphon Tail!
        </p>
        <p>
          Thanks for being a Habitica user -- you all mean so much to us. We hope that you enjoy
          your presents!
        </p>
        <div class="small mb-3">by Lemoness, Beffymaroo, and Baconsaur</div>
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
