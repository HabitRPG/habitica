import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'JUNE BACKGROUNDS AND ARMOIRE ITEMS, AND WIKI SPOTLIGHT ON PERFECT DAYS';
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
        <h2>6/5/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>June Backgrounds and Armoire Items!</h3>
            <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can sing rounds in a Rowboat, fish at the Docks, or wave a Pirate Flag. Check them out under User Icon > Backgrounds!</p>
            <p>Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including the Glass Blower Set and the Blue Party Dress. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
            <div class="small mb-3">by ChimeraLiani, Gerald The Pixel, AnnDeLune, CarolinaAsh, eyenne, Alonquian TGW, and Migu the Wanderer</div>
            <div class="media align-items-center">
              <div class="scene_perfect_day mr-3"></div>
              <div class="media-body">
                <h3>Blog Post: Perfect Day</h3>
                <p>This month's <a href='https://habitica.wordpress.com/2018/05/30/perfect-day/' target='_blank'>featured Wiki article</a> is about the Perfect Day achievement! We hope that it will help you as you work on finishing all your Dailies. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
                <div class="small">by shanaqui and the Wiki Wizards</div>
              </div>
            </div>
          </div>
          <div class="promo_armoire_backgrounds_201806 ml-3 mb-3"></div>
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
  middlewares: [authWithHeaders({
    userFieldsToExclude: ['inbox'],
  })],
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
