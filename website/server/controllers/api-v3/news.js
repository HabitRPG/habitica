import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR LAVA DRAGON SET AND SPOTLIGHT ON BACK TO SCHOOL';
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
            <h2>8/30/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Last Chance for Lava Dragon Set</h3>
            <p>Reminder: this is the final day to <a href='/user/settings/subscription' target='_blank'>subscribe</a> and receive the Lava Dragon Set! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
            <p>Thanks so much for your support! You help keep Habitica running.</p>
            <div class="small mb-3">by Beffymaroo</div>
          </div>
          <div class="promo_mystery_201808"></div>
        </div>
        <div class="media align-items-center">
          <div class="scene_studying mb-3 mr-3"></div>
          <div class="media-body">
            <h3>User Spotlight Special: Back-To-School Edition</h3>
            <p>Are you getting ready for school to start (or perhaps school has already begun) and using Habitica to motivate and organize yourself? Check out this special <a href='https://habitica.wordpress.com/2018/08/30/user-spotlight-special-edition-tips-for-back-to-school/' target='_blank'>User Spotlight post</a>, featuring advice from fellow Habiticans! They offer lots of useful tips for using your task lists and more to get a jump-start on your studies (or teaching) for this year.</p>
            <div class="small mb-3">by shanaqui</div>
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
