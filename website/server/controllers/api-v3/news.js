import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'CELESTIAL AND RAINBOW HATCHING POTIONS! PLUS USE CASE SPOTLIGHT ON MAKING ROUTINES';
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
            <h2>3/21/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_celestial_rainbow_potions center-block"></div>
        <h3>Celestial and Rainbow Hatching Potions</h3>
        <p>There's a new pet breed in town! Check out the brand-new Celestial Potions and the return of Rainbow Potions to brighten your Spring avatar look from <a href='/shops/market'>the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Magic Hatching Potion Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
        <p>After they're gone, it will be at least a year before the Celestial or Rainbow Hatching Potions are available again, so be sure to get them now!</p>
        <div class="small mb-3">by Bonogo, Mara, Beffymaroo, and SabreCat</div>
        <div class="scene_todos center-block"></div>
        <h3>Use Case Spotlight: Routines</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/03/21/use-case-spotlight-setting-up-a-routine/' target='_blank'>Use Case Spotlight</a> is about Routines! It features a number of great suggestions submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6'>Use Case Spotlights Guild</a>. We hope it helps any of you who might be looking for new ideas to set up related tasks.</p>
        <p>Plus, we're collecting user submissions for the next spotlight! How do you use Habitica to review and evaluate your tasks? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by shanaqui</div>
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
    const user = res.locals.user;

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => {
      return n && n.type === 'NEW_STUFF';
    });
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;
