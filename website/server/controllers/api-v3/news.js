import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA BIRTHDAY PARTY!';
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
            <h2>1/31/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_birthday_2020 center-block"></div>
        <h3>Habitica Birthday Bash</h3>
        <p>
          January 31st is Habitica's Birthday! Thank you so much for being a part of our
          community - it means a lot.
        </p>
        <p>Now come join us and the NPCs as we celebrate!</p>
        <h3>Cake for Everybody!</h3>
        <p>
          In honor of the festivities, everyone has been awarded an assortment of yummy cake to
          feed to your pets! Plus, for the next two days <a href='/shops/market'>Alexander the
          Merchant</a> is selling cake in his shop, and cake will sometimes drop when you complete
          your tasks. Cake works just like normal pet food, but if you want to know what type of
          pet likes each slice, <a href='http://habitica.wikia.com/wiki/Food' target='_blank'>the
          wiki has spoilers</a>.
        </p>
        <h3>Party Robes</h3>
        <p>There are Party Robes available for free in the Rewards column! Don them with pride.</p>
        <h3>Birthday Bash Achievement</h3>
        <p>
          In honor of Habitica's birthday, everyone has been awarded the Habitica Birthday Bash
          achievement! This achievement stacks for each Birthday Bash you celebrate with us.
        </p>
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
