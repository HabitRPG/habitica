import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'VETERAN PETS AND NEW STAFF MEMBERS';
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
            <h2>10/23/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_veteran_pets center-block"></div>
        <h3>New Veteran Pet!</h3>
        <p>Hello Habiticans! Everyone is doing really well with the transition to our new <a href='https://habitica.wordpress.com/2018/10/11/coming-soon-unique-usernames/' target='_blank'>unique username system</a>!</p>
        <p>As a reward for confirming your username, you've been granted a veteran pet!  If you haven't confimed yet, your new pet will appear in your Stable as soon as you do. Which pet? That depends on how many major changes to Habitica you've been around for.</p>
        <p>Enjoy, and thank you for being part of our community- it means a lot to us! <3</p>
        <div class="small mb-3">by Beffymaroo, SabreCat, Apollo, Piyo, viirus, Paglias, and TheHollidayInn</div>
        <div class="media align-items-center">
          <div class="npc_apollo ml-3"></div>
          <div class="media-body">
            <h3>New Staff Members: Apollo and Piyo</h3>
            <p>We're thrilled to announce that our long-time designers Apollo and Piyo will be coming onboard as staff members! They've done a lot of beautiful work on the site and the mobile apps and we couldn't be happier to welcome them aboard. Go congratulate them in <a href='/groups/tavern'>the Tavern</a>!</p>
            <div class="small mb-3">by the Habitica Team</div>
          </div>
          <div class="npc_piyo mr-3"></div>
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
