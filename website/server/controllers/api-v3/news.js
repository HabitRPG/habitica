import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW PET QUEST: KANGAROOS! PLUS SPOTLIGHT ON HABITICA COMMUNITY INVOLVEMENT';
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
            <h2>8/16/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>New Pet Quest: Kangaroo Catastrophe!</h3>
            <p>Ever feel like you've dodged a dreaded task, but it just comes back around to brain you like a whirling boomerang? Get the latest pet quest, "Kangaroo Catastrophe," from the <a href='/shops/quests' target='_blank'>Quest Shop</a> and earn some keen kangaroo pets by completing those real-life tasks!</p>
            <div class="small">Art by stefalupagus, mewrose, LilithofAlfheim, ChrisSpatzerl, Willow the Witty, tricksy.fox, and Beffymaroo</div>
            <div class="small mb-3">Writing by summra and SabreCat</div>
          </div>
          <div class="promo_kangaroo ml-3 mb-3"></div>
        </div>
        <div class="media align-items-center">
          <div class="scene_tavern mr-3"></div>
          <div class="media-body">
            <h3>Use Case Spotlight and Guild Spotlight on Getting Involved with Habitica's Community</h3>
            <p>We've got new posts on the blog all about ways to get involved with Habitica's community! First, there's a <a href='https://habitica.wordpress.com/2018/08/16/getting-involved-in-habitica-guilds-for-contributing/' target='_blank'>Guild Spotlight</a> that highlights the Guilds that can help you earn a place as an esteemed Habitica contributor. We've also posted a <a href='https://habitica.wordpress.com/2018/08/16/use-case-spotlight-get-involved-in-the-habitica-community/' target='_blank'>Use Case Spotlight</a> featuring a number of great suggestions for other ways to get involved with contributing or simply getting social on the site and apps! These suggestions were submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6' target='_blank'>Use Case Spotlights Guild</a>.</p>
          </div>
        </div>
        <p>Plus, we're collecting user submissions for the next Use Case Spotlight! How do you use Habitica as you learn practical and hands-on skills? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by shanaqui</div>
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
