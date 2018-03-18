import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'KEYS TO THE KENNELS AND USE CASE SPOTLIGHT';
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
        <div class="media">
          <div class="align-self-center mr-3 ${baileyClass}"></div>
          <div class="media-body">
            <h1 class="align-self-center">${res.t('newStuff')}</h1>
          </div>
        </div>
        <h2>3/15/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Release Pets & Mounts!</h3>
            <p>The Keys to the Kennels have returned! Now, when you collect all 90 standard pets or mounts, you can release them for 4 Gems, letting you collect them all over again! If you want a real challenge, you can attain the elusive Triad Bingo by filling your stable with all of both, then set them all free at once for 6 Gems!</p>
          </div>
          <div class="pet_key ml-3"></div>
        </div>
        <p>Scroll to the bottom of <a href='/shops/market' target='_blank'>the Market</a> to purchase a Key. It takes effect immediately on purchase, so say your goodbyes first!</p>
        <div class="small mb-3">by TheHollidayInn, Apollo, Lemoness, deilann, and Megan</div>
        <div class="media align-items-center">
          <div class="scene_sweeping mr-3"></div>
          <div class="media-body">
            <h3>Use Case Spotlight: Spring Cleaning</h3>
            <p>This month's <a href='https://habitica.wordpress.com/2018/03/15/use-case-spotlight-spring-cleaning/' target='_blank'>Use Case Spotlight</a> is about Spring Cleaning! It features a number of great suggestions submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6' target='_blank'>Use Case Spotlights Guild</a>. We hope it helps any of you who might be looking to start spring with a nice, clean dwelling.</p>
            <p>Plus, we're collecting user submissions for the next spotlight! How do you use Habitica to Make a Difference? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
            <div class="small mb-3">by Beffymaroo</div>
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
