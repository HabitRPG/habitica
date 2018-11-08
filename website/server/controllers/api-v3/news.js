import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'FEATURED WIKI: MAGE’S TOWER; UNIQUE USERNAMES COMING SOON!';
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
            <h2>11/8/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>Blog Post: The Mage's Tower</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2018/11/07/the-mages-tower/' target='_blank'>featured Wiki article</a> is about The Mage's Tower! We hope that it will help you as customize Habitica to fit your goals and needs. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
        <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
        <div class="scene_dailies center-block"></div>
        <h3>Unique Usernames are Coming!</h3>
        <p>Hello Habiticans! Next week, we will complete the transition from login names to unique usernames. We're making this change so it’s easier to find and invite your friends to Parties, Guilds, and Challenges, mention people in chat, and so that we can introduce even more useful social features in the future.</p>
        <p>You can check and confirm (or change) your current Username in <a href='/user/settings/site' target='_blank'>Settings</a>.</p>
        <p>Once you’ve confirmed, you’ll receive a special veteran pet as a reward! If you’d like to learn more about this change, this <a href='https://habitica.wikia.com/wiki/Player_Names' target='_blank'>Wiki page</a> has more detailed information. Thanks again for being part of our community!</p>
        <div class="small mb-3">by Beffymaroo, SabreCat, Apollo, Piyo, viirus, Paglias, and TheHollidayInn</div>
        <div class="promo_veteran_pets center-block"></div>
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
