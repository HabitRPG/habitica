import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SHIMMER HAIR, PASTEL SKINS, HABITICA FORGE TWITTER, AND GUILD SPOTLIGHT';
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
        <h2>4/5/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="promo_shimmer_pastel center-block"></div>
        <h3>Shimmer Hair Colors and Pastel Skin Set</h3>
        <p>The Seasonal Edition Shimmer Hair Colors and Pastel Skin Set are now available for purchase in User > Edit Avatar! These skin sets will only be available to purchase until April 30th, and then they will disappear from the shop until next Spring Fling. If you buy them, though, you will have access to them year-round!</p>
        <div class="small mb-3">by Lemoness and McCoyly</div>
        <h3>The Habitica Forge</h3>
        <p>We've launched an exciting new Twitter account! <a href='https://twitter.com/habiticaforge' target='_blank'>Habitica Forge</a> will be tweeting automated updates about all the work of our fantastic blacksmiths. If you're curious about what fixes and improvements are in the works, be sure to check it out! This account will also be the official source for updates from Habitica about any site or app access issues or outages.</p>
        <div class="small mb-3">by Beffymaroo, TheHollidayInn, Paglias, Alys, Viirus, SabreCat, Blade, and all Habitica's wonderful Blacksmiths!</div>
        <h3>Be the Change: Guilds for Making a Difference</h3>
        <p>There's a new <a href='https://habitica.wordpress.com/2018/04/05/be-the-change-guilds-for-making-a-difference/' target='_blank'>Guild Spotlight on the blog</a> that highlights the Guilds that can help you as you work to make the world a better place! Check it out now to find Habitica's best communities for volunteers and general do-gooders.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="scene_positivity center-block"></div>
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
