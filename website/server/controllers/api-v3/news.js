import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'UNIQUE USERNAMES ARE HERE!';
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
            <h2>11/14/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <p>Hello Habiticans! We're excited to announce the launch of our unique username system! We've made this change so it’s easier to find and invite your friends to Parties, Guilds, and Challenges, mention people in chat, and more. In the future we hope to use this functionality to introduce even more useful features, such as the option to receive notifications if you are mentioned in chat.</p>
        <p>You can check and change your current Username in <a href='/user/settings/site' target='_blank'>Settings</a>. If you've just confirmed, check your Stable to find the Veteran Pet you've been given as a reward!</p>
        <p>If you’d like to learn more about this change, this <a href='https://habitica.wikia.com/wiki/Player_Names' target='_blank'>Wiki page</a> has more detailed information.</p>
        <p>Thank you for being patient as we make these changes to improve Habitica!</p>
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
