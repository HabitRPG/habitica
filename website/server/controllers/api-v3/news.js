import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SPECIAL TIME TRAVELERS QUEST AND LAST CHANCE FOR AUGUST ITEMS!';
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
            <h2>8/29/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="quest_robot center-block"></div>
        <h3>Special Time Travelers' Pet Quest: Mysterious Mechanical Marvels!</h3>
        <p>Hello Habiticans! We've released a brand-new quest in the Time Travelers' shop! It will be available at the cost of one <a href='https://habitica.fandom.com/wiki/Mystic_Hourglass' target='_blank'>Mystic Hourglass</a>, and is not limited, so you can buy it anytime you like, and as many times as you like. Get "<a href='/shops/time'>Mysterious Mechanical Marvels</a>", and earn some futuristic Robot pets by completing your real-life tasks!</p>
        <div class="small mb-3">by Beffymaroo, Rev, artemie, McCoyly, FolleMente, elyons1, QuartzFox, and SabreCat</div>
        <div class="promo_mystery_201908 center-block"></div>
        <h3>Last Chance for Footloose Faun Set</h3>
        <p>Reminder: this weekend is your final chance to <a href='/user/settings/subscription'>subscribe and receive the Footloose Faun Set</a>! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_farm_friends_bundle center-block"></div>
        <h3>Last Chance for Farm Friends Pet Quest Bundle</h3>
        <p>Time is also running out for the discounted Farm Friends Pet Quest Bundle, featuring the Cow, Horse and Sheep quests all for seven Gems! Be sure to lasso it before it gallops out of the <a href='/shops/quests'>Quest Shop</a>!</p>
        <div class="small">by Lemoness and SabreCat</div>
        <div class="small">Art by UncommonCriminal, Soloana, fuzzytrees, Feralem Tau, Eevachu, Beffymaroo, JessicaChase, starsystemic, nonight, Misceo and Tocath</div>
        <div class="small mb-3">Writing by schizelle, VikingRunner, Salambander, Leephon, and Lemoness</div>
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
