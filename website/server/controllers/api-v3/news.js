import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'DYSHEARTENER THIRD RAGE STRIKE AND HUG A BUG QUEST BUNDLE';
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
        <h2>3/6/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>World Boss: Dysheartener Attacks the Quest Shop!</h3>
            <p>Aaaah! We've left our Dailies undone again, and the Dysheartener has mustered the energy for one final blow against our beloved shopkeepers. The countryside around Ian the Quest Master is ripped apart by its Shattering Heartbreak attack, and Ian is struck to the core by the horrific vision. We're so close to defeating this monster.... Hurry! Don't stop now!</p>
            <div class="small mb-3">by Lemoness, Beffymaroo, SabreCat, viirus, piyorii, and Apollo</div>
            <h3>New Discounted Quest Bundle: Hug a Bug!</h3>
            <p>If you are looking to add some insect friends to your Habitica stable, you're in luck! From now until March 31, you can purchase the Hug a Bug Pet Quest Bundle and receive the Snail, Beetle, and Butterfly quests, all for only 7 Gems! That's a discount of 5 Gems from the price of purchasing them separately. Check it out in the <a href='/#/options/inventory/quests' target='_blank'>Quest Shop</a> today!</p>
            <p>If you’d prefer not to see bugs in Habitica due to a phobia, check out the <a href='http://habitica.wikia.com/wiki/Phobia_Protection_Extension' target='_blank'>Phobia Protection Extension</a> and enable the option for hiding "Beetles"!</p>
            <div class="small">by Lemoness, SabreCat, and Beffymaroo</div>
            <div class="small">Art by Pfeffernusse, Megan, Pocketmole, overomega, Misceo, UncommonCriminal, Zorella, Anna Glassman, Leephon, Lilith of Alfheim, Ac, starsystemic, and Karithina</div>
            <div class="small mb-3">Writing by: arachnidstardis, emiausti, and AnnDeLune</div>
          </div>
          <div class="promo_hugabug_bundle ml-3"></div>
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
