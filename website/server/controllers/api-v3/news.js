import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'DECEMBER LAST CHANCE, SNOWBALLS, NEW YEAR’S RESOLUTION BLOG POST, AND NEW YEAR’S HAT AND CARDS!';
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
            <h2>12/31/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="npc_justin center-block"></div>
        <h3>Party Hats</h3>
        <p>
          In honor of the new year, some free Party Hats are available in your Rewards! Each year
          you celebrate New Year's with Habitica, you unlock a new hat. Enjoy, and stay tuned for
          the matching robes in late January during our annual Habitica Birthday Bash!
        </p>
        <div class="small mb-3">by Lemoness and SabreCat</div>
        <div class="inventory_special_nye center-block"></div>
        <h3>New Year's Cards</h3>
        <p>
          Until January 1st only, the <a href='/shops/market'>Market</a> is stocking New Year's
          Cards! Now you can send cards to your friends (and yourself) to wish them a Happy Habit
          New Year. All senders and recipients will receive the Auld Acquaintance badge!
        </p>
        <div class="small mb-3">by Lemoness and SabreCat</div>
        <h3>Blog Post: Jumpstart your 2020 Resolution with Habitica!</h3>
        <p>
          Do you have a special resolution or goal for the coming year? Check out a new post on the
          <a href='https://habitica.wordpress.com/2019/12/26/jump-starting-your-2020-new-years-
resolution-with-habitica/' target='_blank'>Habitica Blog</a> with our best tips and resources to
          help you make and keep your 2020 resolution!
        </p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_snowballs center-block"></div>
        <h3>Snowballs!</h3>
        <p>
          The <a href='/shops/seasonal'>Seasonal Shop</a> is also stocking Snowballs for Gold!
          Throw them at your friends to have an exciting effect. If you get hit with a snowball,
          you earn the Annoying Friends badge. The results of being hit with a Snowball will last
          until the end of your day, but you can also reverse them early by buying Salt from the
          Rewards column. Snowballs are available until January 31st.
        </p>
        <div class="small mb-3">by Shaner and Lemoness</div>
        <div class="promo_mystery_201912 center-block"></div>
        <h3>Last Chance for Polar Pixie Set</h3>
        <p>
          Reminder: the 31st is the final day to <a href='/user/settings/subscription'>
          subscribe</a> and receive the Polar Pixie item set! Subscribers also get a cute Jackalope
          pet, and the ability to buy Gems with Gold. The longer your subscription, the more Gems
          you can get!
        </p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
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
