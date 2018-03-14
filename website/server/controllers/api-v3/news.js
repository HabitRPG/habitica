import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SHIMMER AND RAINBOW HATCHING POTIONS; SPRING CLEANING GUILD SPOTLIGHT';
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
        <h2>3/13/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media">
          <div class="media-body">
            <h3>Shimmer and Rainbow Hatching Potions</h3>
            <p>We've brought back Shimmer Potions, and added a brand-new Magic Hatching Potion: Rainbow! Between now and March 31st, you can buy these Hatching Potions from <a href='/shops/market' target='_blank'>the Market</a> and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Magic Hatching Potion Pets aren't picky, so they'll happily eat any kind of food that you feed them!</p>
            <p>After they're gone, it will be at least a year before the Shimmer or Rainbow Hatching Potions are available again, so be sure to get them now!</p>
            <div class="small mb-3">by Beffymaroo, Teto Forever, tricksy.fox, and SabreCat</div>
            <div class="media">
              <div class="scene_sweeping mr-3"></div>
              <div class="media-body">
                <h3>Another One Fights the Dust: Guilds for Spring Cleaning</h3>
                <p>There's a new <a href='https://habitica.wordpress.com/2018/03/08/another-one-fights-the-dust-guilds-for-spring-cleaning/' target='_blank'>Guild Spotlight on the blog</a> that highlights the Guilds that can help you with your Spring Cleaning! Check it out now to find Habitica's best communities for help and motivation with cleaning.</p>
                <div class="small mb-3">by Beffymaroo</div>
              </div>
            </div>
          </div>
          <div class="promo_rainbow_potions ml-3"></div>
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
