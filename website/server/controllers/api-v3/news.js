import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it
// from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA HIRING ANDROID DEVELOPER! AND BLOG POST ON THE QUEST SHOP';

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
            <h2>10/17/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>Habitica is Hiring! Android Developer Position</h3>
        <p>Want to join the Habitica team? We’re looking to hire a new developer to help with our Android app! Our ideal candidate is a mobile developer with experience in Kotlin who is capable of supporting existing legacy code and working with our team to continue improving the user experience. You'll make major contributions that help serve and grow an audience of millions of users!</p>
        <p>If this sounds like a job you'll love, check out the <a href='https://forms.gle/rdyDPTRD8ZjE2qLG8' target='_blank'>full job posting</a> for more information and to fill out an application. </p>
        <div class="scene_quest_shop center-block"></div>
        <h3>Blog Post: Quest Shop</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/10/16/quest-shop/' target='_blank'>featured Wiki article</a> is about the Quest Shop! We hope that it will help you as you look for additional ways to keep your Habitica adventure fun and motivating. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
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
    const { user } = res.locals;

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => n && n.type === 'NEW_STUFF');
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

export default api;
