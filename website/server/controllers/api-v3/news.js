import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = "VALENTINE'S DAY CELEBRATION! INCLUDING CUPID AND ROSE QUARTZ HATCHING POTIONS";
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
            <h2>2/12/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_valentines center-block"></div>
        <h3>Habitica Celebrates Valentine's Day!</h3>
        <p>In honor of Habitica's holiday celebrating all forms of love, whether it's friendship, familial, or romantic, some of the shopkeepers are dressed up! Take a look around to enjoy their new festive decorations.</p>
        <div class="small mb-3">by Beffymaroo and Lemoness</div>
        <h3>Send a Valentine</h3>
        <p>Help motivate all of the lovely people in your life by sending them a caring Valentine. For the next week only, Valentines can be purchased for 10 Gold from the <a href='/shops/market'>Market</a>. For spreading love and joy throughout the community, both the giver AND the receiver get a coveted "Adoring Friends" badge. Hooray!</p>
        <p>While you're there, why not check out the other cards that are available to send to your party? Each one gives a special achievement of its own...</p>
        <div class="small mb-3">By Lemoness and SabreCat</div>
        <div class="promo_valentines_potions center-block"></div>
        <h3>Cupid and Rose Quartz Hatching Potions</h3>
        <p>There's a new pet breed in town! We're excited to introduce the new Rose Quartz Magic Hatching Potions, and to announce the return of Cupid Potions! Between now and February 28, you can buy these potions from <a href='/shops/market'>the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Magic Potion Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
        <p>After they're gone, it will be at least a year before the Cupid or Rose Quartz Hatching Potions are available again, so be sure to get them now!</p>
        <div class="small mb-3">by Vampitch,Willow the Witty, and SabreCat</div>
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
