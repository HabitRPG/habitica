import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA COMIC-CON MEETUP AND WIKI SPOTLIGHT ON THE POMODORO TECHNIQUE';
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
            <h2>7/19/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Habitica at San Diego Comic Con!</h3>
            <p>Beffymaroo will be representing Habitica at San Diego Comic Con this year. If you’d like to meet her, along with other fellow Habiticans, join us at the Habitica SDCC Meetup! Beffymaroo will be handing out Habitica stickers, promo codes for the Unconventional Armor set, and other exciting special swag (quantities limited!).</p>
            <p>You can find the meetup on Saturday, July 21, at the San Diego Bayfront Hilton lobby from 12:00-1:00 PM! Look for the purple Gryphon banner. Can’t wait to meet you :)</p>
          </div>
          <div class="promo_unconventional_armor ml-3 mb-3"></div>
        </div>
        <div class="media align-items-center">
          <div class="scene_pomodoro mr-3"></div>
          <div class="media-body">
            <h3>Wiki Spotlight: The Pomodoro Technique</h3>
            <p>This month's <a href='https://habitica.wordpress.com/2018/07/18/pomodoro/' target='_blank'>featured Wiki article</a> is about the Pomodoro Technique! We hope that it will help you as you look for new productivity strategies. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
            <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
          </div>
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
