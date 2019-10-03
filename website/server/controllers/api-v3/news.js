import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SPOOKY SPARKLES AND COSTUME CHALLENGE!';
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
            <h2>10/3/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_spooky_sparkles center-block"></div>
        <h3>Spooky Sparkles in the Seasonal Shop</h3>
        <p>There's a new Gold-purchasable item in the Seasonal Shop: <a href='/shops/seasonal'>Spooky Sparkles</a>! Buy some and then cast it on your friends. I wonder what it will do?</p>
        <p>If you have Spooky Sparkles cast on you, you will receive the "Alarming Friends" badge! Don't worry, any mysterious effects will wear off the next day.... or you can cancel them early by buying an Opaque Potion!</p>
        <p>While you're at it, be sure to check out all the other items in the Seasonal Shop! There are lots of equipment items from the previous Fall Festivals. The Seasonal Shop will only be open until October 31st, so stock up now.</p>
        <div class="small mb-3">by Lemoness and SabreCat</div>
        <div class="promo_costume_achievement center-block"></div>
        <h3>Costume Challenge</h3>
        <p>The Community Costume Challenge has begun! Between now and October 31st, dress up as your avatar in real life and post a photo on social media to get the coveted Costume Challenge badge! <a href='/challenges/b2b4b952-c79e-47ff-9c5d-ae72d04aa8ee'>Read the full rules on the Challenge page</a>.</p>
        <p>Looking for inspiration? Check out the <a href='https://blog.habitrpg.com/cosplay' target='_blank'>Cosplay hashtag on our Tumblr</a> to see past entries!</p>
        <div class="small mb-3">by Beffymaroo</div>
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
