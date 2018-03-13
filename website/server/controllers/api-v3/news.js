import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'DYSHEARTENER DEFEATED!';
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
          <div class="promo_hippogriff"></div>
        </div>
        <h2>3/8/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <h3>World Boss: Dysheartener Defeated!</h3>
        <p>Together, everyone in Habitica strikes a final blow to their tasks, and the Dysheartener rears back, shrieking with dismay. "What's wrong, Dysheartener?" AnnDeLune calls, eyes sparkling. "Feeling discouraged?"</p>
        <p>Glowing pink fractures crack across the Dysheartener's carapace, and it shatters in a puff of pink smoke. As a renewed sense of vigor and determination sweeps across the land, a flurry of delightful sweets rains down upon everyone.</p>
        <p>The crowd cheers wildly, hugging each other as their pets happily chew on the belated Valentine's treats. Suddenly, a joyful chorus of song cascades through the air, and gleaming silhouettes soar across the sky.</p>
        <p>Our newly-invigorated optimism has attracted a flock of Hopeful Hippogriffs! The graceful creatures alight upon the ground, ruffling their feathers with interest and prancing about. "It looks like we've made some new friends to help keep our spirits high, even when our tasks are daunting," Lemoness says.</p>
        <p>Beffymaroo already has her arms full with feathered fluffballs. "Maybe they'll help us rebuild the damaged areas of Habitica!"</p>
        <p>Crooning and singing, the Hippogriffs lead the way as all the Habitcans work together to restore our beloved home.</p>
        <div class="small mb-3">by Lemoness, Beffymaroo, SabreCat, AnnDeLune, viirus, piyorii, and Apollo</div>
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
