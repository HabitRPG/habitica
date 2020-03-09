import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'MARCH BACKGROUNDS AND ARMOIRE ITEMS! HOPEFUL HIPPOGRIFFS IN THE TIME TRAVELERS SHOP!';
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
            <h2>3/3/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_armoire_backgrounds_202003 center-block"></div>
        <h3>March Backgrounds and Armoire Items!</h3>
        <p>
          We’ve added three new backgrounds to the Background Shop! Now your avatar can dally among
          Giant Flowers, admire a fancy Succulent Garden, and party with pollinators in the
          Butterfly Garden. Check them out under User Icon > Backgrounds!
        </p>
        <p>
          Plus, there’s new Gold-purchasable equipment in the Enchanted Armoire, including the
          Baseball Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)
        </p>
        <div class="small mb-3">
          by Vikte, Mantichore, FolleMente, Aspiring Advocate, QuartzFox, katieslug, and SabreCat
        </div>
        <div class="Pet-Hippogriff-Hopeful center-block"></div>
        <h3>Hopeful Hippogriffs in the Time Travelers' Shop!</h3>
        <p>
          The <a href='/shops/time'>Time Travelers</a> have traveled back in time to obtain some
          rare Hopeful Hippogriff pets and mounts! You can buy them with Mystic Hourglasses, which
          are awarded to <a href='/user/settings/subscription'>long-term subscribers</a>. Thanks
          for helping us to keep Habitica running!
        </p>
        <div class="small mb-3">by Lemoness and SabreCat</div>
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
