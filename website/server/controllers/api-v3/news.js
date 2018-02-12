import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'VALENTINE\'S DAY CELEBRATION AND CHAT IMPROVEMENTS';
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
        <h2>2/12/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <h3>Habitica Celebrates Valentine's Day!</h3>
        <p>In honor of Habitica's holiday celebrating all forms of love, whether it's friendship, familial, or romantic, some of the shopkeepers are dressed up! Take a look around to enjoy their new festive decorations.</p>
        <div class="small mb-3">By Beffymaroo and Lemoness</div>
        <div class="promo_valentines center-block"></div>
        <h3>Send a Valentine</h3>
        <p>Help motivate all of the lovely people in your life by sending them a caring Valentine. For the next week only, Valentines can be purchased for 10 gold from the <a href="/shops/market">Market</a>. For spreading love and joy throughout the community, both the giver AND the receiver get a coveted "Adoring Friends" badge. Hooray!</p>
        <p>While you're there, why not check out the other cards that are available to send to your party? Each one gives a special achievement of its own...</p>
        <div class="small mb-3">by Lemoness and SabreCat</div>
        <h3>New Chat Performance Improvements</h3>
        <p>We've deployed some behind-the-scenes improvements to the Tavern chat, which should cause the messages and avatars to load more quickly. Additionally, each chat message that you post in the Tavern and in Guilds will now remember the outfit your avatar was wearing when you post it, even on a refresh! We hope that these changes will make chatting even more enjoyable.</p>
        <div class="small mb-3">By TheHollidayInn and Alys</div>

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
