import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'CUPID HATCHING POTIONS AND RESOLUTION PLOT-LINE CONTINUES';
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
        <div class="media">
          <div class="align-self-center mr-3 ${baileyClass}"></div>
          <div class="media-body">
            <h1 class="align-self-center">${res.t('newStuff')}</h1>
          </div>
        </div>
        <h2>2/8/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <h3>Cupid Hatching Potions</h3>
        <div class="media">
          <div class="media-body">
            <p>There's a new pet breed in town! Between now and February 28th, you can buy Cupid Hatching Potions from <a href="/shops/market">the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Cupid Potion Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
            <p>After they're gone, it will be at least a year before the Cupid Hatching Potions are available again, so be sure to get them now!</p>
            <div class="small mb-3">by Willow the Witty and SabreCat</div>
            <h3>Resolution Plot-Line: Goo Galore</h3>
            <p>Remember the mystery of those Habiticans who grew abruptly disheartened with their New Year's Resolutions? There's just been a significant development!</p>
            <p>One of the investigation teams, led by Viirus, Apollo, and Piyorii, has turned up something very strange in the broken buildings where those Habiticans live...</p>
            <p>"The cracks in the buildings have started to glow," Viirus says. "And look!" He points, and you see that a strange orange goo is oozing from the shattered stone. Gingerly, you touch it -- it smells sweet and is very, very sticky, almost like caramel.</p>
            <p>Hmm.... let's keep watch for the cause in the coming days.</p>
          </div>
          <div class="promo_cupid_potions ml-3"></div>
        </div>

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
