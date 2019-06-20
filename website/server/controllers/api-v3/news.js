import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW AND RETURNING HATCHING POTIONS, USE CASE SPOTLIGHT, AND GUILD SPOTLIGHT';
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
            <h2>6/20/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_glass_watery_potions center-block"></div>
        <h3>Watery and Glass Hatching Potions</h3>
        <p>There's a new pet breed in town! Check out the brand-new Watery Potions and the return of Glass Potions. You can get them in <a href='/shops/market'>the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Magic Hatching Potion Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
        <p>These potions will be available until the Summer Splash Gala ends on July 31. After they're gone, it will be at least a year before the Watery or Glass Hatching Potions are available again, so be sure to get them now!</p>
        <div class="small mb-3">by Mako, Willow the Witty, Persephone, and SabreCat</div>
        <div class="scene_casting_spells center-block"></div>
        <h3>Use Case Spotlight: The Warrior</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/06/20/use-case-spotlight-making-the-most-of-the-warrior-class/' target='_blank'>Use Case Spotlight</a> is about the Warrior class! It features a number of great suggestions submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6'>Use Case Spotlights Guild</a>. We hope it helps any of you who might be deciding which class is best for your play style.</p>
        <p>Plus, we're collecting user submissions for the next spotlight! We want to hear your best tricks and strategies for playing the Healer class to its full advantage.  We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by shanaqui</div>
        <div class="scene_positivity center-block"></div>
        <h3>Guild Spotlight: More New and Notable Guilds</h3>
        <p>There's a new <a href='https://habitica.wordpress.com/2019/06/20/new-and-notable-guild-spotlight-6/' target='_blank'>Guild Spotlight</a> on the blog that highlights a brand new group of new and upcoming Guilds! Check it out now to find up and coming communities where you can discuss your goals and interests.</p>
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
