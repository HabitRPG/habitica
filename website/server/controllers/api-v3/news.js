import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'WORLDCON HABITICA MEETUP AND BLOG POST ON ROGUES';
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
            <h2>8/15/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_unconventional_armor center-block"></div>
        <h3>Habitica Meetup at Worldcon!</h3>
        <p>shanaqui and Dewines will be representing Habitica at <a href='https://dublin2019.com/' target='_blank'>Worldcon</a>  this year. If you’d like to meet them along with other fellow Habiticans, join us at the Habitica Worldcon Meetup! They'll be handing out promo codes for the special Unconventional Armor set and Habitica stickers (note quantities may be limited). Look for shanaqui's Habitica t-shirt!</p>
        <p>You can find the meetup on Saturday, August 17, at ground floor foyer of Convention Centre Dublin from 5:00-6:00 PM local time!  Can’t wait to meet you :)</p>
        <div class="scene_casting_spells center-block"></div>
        <h3>Blog Post: Rogue</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/08/14/rogue/' target='_blank'>featured Wiki article</a> is about the Rogue class! We hope that it will help you as you choose the best class for your Habitica play style. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
        <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
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
