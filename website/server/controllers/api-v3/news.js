import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'SUMMER SPLASH HATCHING POTIONS AND SPLASHY SKINS';
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
            <h2>6/23/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_sand_sculpture_potions center-block"></div>
        <h3>Summer Splash Magic Hatching Potions!</h3>
        <p>
          There's a new pet breed in town! Check out the brand-new Sand Sculpture Potions and the
          return of Aquatic and Watery Potions to heat up your Summer avatar look. Get them from
          <a href='/shops/market'>the Market</a> and use them to hatch any standard pet egg. (Magic
          Hatching Potions do not work on Quest Pet eggs.) Magic Hatching Potion Pets aren't picky,
          so they'll happily eat any kind of food that you feed them!
        </p>
        <p>
          These potions will be available until Summer Splash ends on July 31. After they're gone,
          it will be at least a year before these Hatching Potions return, so be sure to get them
          now!
        </p>
        <div class="small mb-3">
          by Shine Caramia, a_diamond, Persephone, Stefalupagus, Beffymaroo and SabreCat
        </div>
        <div class="promo_splashy_skins center-block"></div>
        <h3>Splashy Skins!</h3>
        <p>
          The Seasonal Edition Splashy Skins are back! You can complete your summer avatar look
          with Clownfish, Deep Ocean, Tropical Water, Mergold, Mergreen, Merblue, Merruby, and
          Shark Skins.
        </p>
        <p>
          This Seasonal Edition customization set will only be available to purchase until July
          31st, after which they'll be gone until next year, so be sure to scoop them up now! You
          can find them in User > Edit Avatar!
        </p>
        <div class="small mb-3">by Lemoness and UncommonCriminal</div>
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
