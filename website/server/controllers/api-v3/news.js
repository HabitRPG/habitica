import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW PET QUEST, NEW ACHIEVEMENTS, AND THE RETURN OF THE ODDBALLS BUNDLE';
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
            <h2>6/11/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_dolphin_quest center-block"></div>
        <h3>New Pet Quest: Dolphin! And New Pet Collection and Pet Quest Achievement Badges</h3>
        <p>Feeling doubtful about your ability to tackle your tasks? Could be you have dolphin doldrums! Get the latest pet quest, <a href='/shops/quests'>The Dolphin of Doubt</a>, and earn some chipper dolphin pets by completing your real-life tasks.</p>
        <p>An important announcement regarding quests: We’ll be adding new types of quests with exciting rewards like Magic Hatching Potions! We’ll also continue releasing Pet Quest Bundles so you can work on completing your collection. However, "The Dolphin of Doubt" is the final pet quest we'll be releasing in the Quest Shop for the forseeable future.</p>
        <p>We're also releasing new achievements so you can celebrate your successes in the world of Habitican pet collecting! Now you can earn badges for your profile when you complete certain categories of pet quests and for collecting pets and mounts in the classic pet colors. We're kicking off with: Cover Your Bases and All Your Base for collecting all the classic Base pets and mounts, Just Add Water for completing quests for aquatic pets (including the new Dolphins!), and Mind over Matter for completing all pet quests for (normally) inanimate objects.</p>
        <p>If you’ve already completed the required Quests for a newly released achievement, you don’t have to do them all again! Just complete any one of the relevant Quests and the Achievement will unlock.</p>
        <div class="small mb-3">by Shogirlgeek, mewrose, Aries Faries, khdarkwolf, confusedcicada, Lady Tabletop, OuttaMyMind, and the Habitica Team</div>
        <div class="promo_oddballs_bundle center-block"></div>
        <h3>Discounted Pet Quest Bundle: Oddballs!</h3>
        <p>In celebration of our new pet quest achievements, the Oddballs Pet Quest Bundle is back! From now until June 30, you can purchase it and receive the Rock, Marshmallow Slime, and Yarn quests, all for only 7 Gems! That's a discount of 5 Gems from the price of purchasing them separately. Check it out in the <a href='/shops/quests'>Quest Shop</a> today!</p>
        <div class="small">Art by PainterProphet, Pfeffernusse, Zorelya, intune, starsystemic, Leephon, Arcosine, stefalupagus, Hachiseiko, TheMushroomKing, khdarkwolf, Vampitch, JinjooHat, UncommonCriminal, Oranges, Darkly, overomega, celticdragon, and Shaner</div>
        <div class="small mb-3">Writing by Bartelmy, Faelwyn the Rising Phoenix, Theothermeme, Bethany Woll, itokro, and Lemoness</div>
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
