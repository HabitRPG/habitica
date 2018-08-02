import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'AUGUST BACKGROUNDS AND ARMOIRE ITEMS, AND QUEST PARTICIPANTS VIEW!';
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
            <h2>8/2/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>New Backgrounds and Armoire Items!</h3>
            <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can fly over a Rocky Canyon, spar on the Training Grounds, and cross a charming Bridge. Check them out under User Icon > Backgrounds!</p>
            <p>Plus, there’s new Gold-purchasable equipment in the Enchanted Armoire, including the Jeweled Archer Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
            <div class="small mb-3">by Lalaitha, Kiwibot, Balduranne, Irrevenant, DialFforFunky, RandomGryffindor, Mewrose, and CitrineQuartzFox</div>
            <h3>New! Quest Partipant List</h3>
            <p>There's a new feature on your Party Page! If you're in a Quest, you can now view all Party members who have joined the Quest via the Participants link in the box where you can see your progress. Enjoy!</p>
            <div class="small mb-3">by Alys</div>
          </div>
          <div class="promo_armoire_backgrounds_201808 ml-3 mb-3"></div>
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
