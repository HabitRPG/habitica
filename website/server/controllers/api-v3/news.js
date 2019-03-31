import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR MARCH SUBSCRIBER GEAR! AND THE APRIL FOOL PROMISES HEʼLL BEHAVE THIS YEAR';
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
            <h2>3/29/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201903 center-block"></div>
        <h3>Last Chance for March Subscriber Gear</h3>
        <p>Reminder: this weekend is your final chance to <a href='/user/settings/subscription'>subscribe</a> and receive the Egg-squisite Armor Set! Subscribing also lets you buy Gems with Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <h3>The April Fool Stops By the Tavern...</h3>
        <p>As March in Habitica comes to a close, everyone is wondering what the ever-impish Master of Rogues, the April Fool, might have in store for his favorite holiday.</p>
        <p>He's stopped by the Tavern today, ostensibly for lunch, but he seems keen to put everyone at ease about the possibility of shenanigans in the near future.</p>
        <p>"I've re-committed myself to health!" he says, happily munching on a crisp, ripe pear. "I'm too busy brushing up on nutrition to possibly pull a prank! If anything I'd rather just help every Habitican get more healthy food into their routines."</p>
        <p>Beffymaroo smiles and leans to whisper to Piyo and SabreCat, on the next bench.</p>
        <p>"Given his track record over the years, I'd say the chance he's going to behave himself this year is about as good as the chance of artichokes falling from the sky."</p>
        <p>Perhaps you should check back when April 1st rolls around to see what's in store…</p>
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
