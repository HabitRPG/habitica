import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'DISCOUNTED PET QUEST BUNDLE: WITCHY FAMILIARS';
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
            <h2>10/15/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_witchy_familiars center-block"></div>
        <p>If you're looking to add some pets to your Habitica stable to match your Fall Festival gear, you're in luck! From now until October 31, you can purchase the Witchy Familiars Pet Quest Bundle and receive the Rat, Spider, and Frog quests, all for only 7 Gems! That's a discount of 5 Gems from the price of purchasing them separately. Check it out in the <a href='/shops/quests'>Quest Shop</a> today!</p>
        <div class="small">by Lemoness and SabreCat</div>
        <div class="small">Art by Pandah, UncommonCriminal, Arcosine, starsystemic, RosemonkeyCT, Jon Arjinborn, and Breadstrings</div>
        <div class="small mb-3">Writing by Token, Arcosine, and Fluitare</div>
        <p>If rats and/or spiders are something you'd prefer not to see in Habitica due to a phobia, check out the <a href='http://habitica.wikia.com/wiki/Phobia_Protection_Extension' target='_blank'>Phobia Protection Extension</a> which will hide any pets, mounts, backgrounds, quest bosses, or equipment featuring spiders and/or rats (as well as snakes, bees, zombies, skeletons, or any combination thereof). We hope that it helps make everyone's Habitica experience fun!</p>
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
