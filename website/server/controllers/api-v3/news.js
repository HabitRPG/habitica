import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA ENAMEL PIN KICKSTARTER!';
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
            <h2>8/20/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/promo_kickstarter.png" class="center-block mw-100 h-auto"></div>
        <h3>Our Kickstarter launches today!</h3>
        <p>Hello adventurers! The Habitica team is excited to announce a new way you can bring RPG magic into your daily life. We’re launching a <a href='https://kickstarter.com/projects/habitica/habitica-class-pins' target='_blank'>Kickstarter campaign</a> to fund enamel pins with the insignia of our four playable classes! If our funding goal is met, backers will get the pin(s) of their choice, a special profile badge and, depending on the funding tier you choose, you can get exclusive animated in-game items. The campaign ends on September 10, so be sure to take a peek soon!</p>
        <p>We’re excited to bring you these new ways to show your Habitica pride. Thank you all so much for all your support and for just being a part of our community.</p>
        <div class="small mb-3">by the Habitica Team</div>
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
