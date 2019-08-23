import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA KICKSTARTER UPDATE AND SPECIAL TIME TRAVELERS QUEST!';
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
            <h2>8/22/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/promo_kickstarter_funded.png" class="center-block mw-100 h-auto"></div>
        <h3>Habitica Class Pins Kickstarter Update</h3>
        <p>Hello Habiticans! We're so excited to say that our <a href='https://www.kickstarter.com/projects/habitica/habitica-class-pins' target='_blank'>Kickstarter campaign</a> for class pins has been fully funded and all of our stretch goals have been met, much more quickly than we expected. We're blown away by all the support you've given us!</p>
        <p>All nine pins as well as the animated pet and mount are now unlocked! If you've been waiting to see if we'd reach all our goals, now's the time to pledge. Thank you all so much for backing us, it means a lot to the team!</p>
        <div class="small mb-3">by The Habitica Team</div>
        <div class="quest_robot center-block"></div>
        <h3>Special Time Travelers' Pet Quest: Mysterious Mechanical Marvels!</h3>
        <p>Hello Habiticans! We've released a brand-new quest in the Time Travelers' shop! It will be available at the cost of one <a href='https://habitica.fandom.com/wiki/Mystic_Hourglass' target='_blank'>Mystic Hourglass</a>, and is not limited, so you can buy it anytime you like, and as many times as you like. Get "<a href='/shops/time'>Mysterious Mechanical Marvels</a>", and earn some futuristic Robot pets by completing your real-life tasks!</p>
        <div class="small mb-3">by Beffymaroo, Rev, artemie, McCoyly, FolleMente, elyons1, QuartzFox, and SabreCat
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
