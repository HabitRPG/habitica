import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'FAIRY AND SUNSHINE GLOW HATCHING POTIONS!';
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
            <h2>5/12/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_fairy_sunshine_potions center-block"></div>
        <p>
          Some favorite pet breeds are back in town! Check out the return of Fairy and Sunshine
          Glow Potions to brighten your May avatar look. Buy them from <a href='/shops/market'>the
          Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not
          work on Quest Pet eggs.) Magic Hatching Potion Pets aren't picky, so they'll happily eat
          any kind of food that you feed them!
        </p>
        <p>
          After they're gone, it will be at least a year before the Fairy or Sunshine Glow Hatching
          Potions are available again, so be sure to get them now!
        </p>
        <div class="small mb-3">by OuttaMyMind, Lt.Cabel, Eslyn, Edge, and SabreCat</div>
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
