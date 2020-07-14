import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'PET QUEST BUNDLE AND SEAFOAM!';
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
            <h2>7/14/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_aquatic_amigos_bundle center-block"></div>
        <h3>Discounted Pet Quest Bundle: Aquatic Amigos!</h3>
        <p>
          If you're looking to add some splashy pets to your Habitica stable, you're in luck! From
          now until July 31, you can purchase the Aquatic Amigos Pet Quest Bundle and receive the
          Axolotl, Cuttlefish, and Octopus quests, all for only 7 Gems! That's a discount of 5 Gems
          from the price of purchasing them separately. Check it out in the <a href='/shops/quests'>
          Quest Shop</a> today!
        </p>
        <div class="small mb-3">
          by PainterProphet, Streak, James Danger, hazel, RiverMori, UncommonCriminal, Urse,
          RBrinks, TokenKnight, wolvenhalo, Lemoness, and SabreCat
        </div>
        <div class="promo_seafoam center-block"></div>
        <h3>Seafoam!</h3>
        <p>
          Throw some Seafoam at your friends and they will turn into a cheerful sea star until
          their next cron! You can buy the Seafoam in the <a href='/shops/seasonal'>Seasonal
          Shop</a> for 15 Gold. Plus, if you get splashed by Seafoam, you'll receive the Aquatic
          Friends badge!
        </p>
        <p>
          Don't want to be a sea star? Just buy some Sand from your Rewards column to reverse it.
        </p>
        <p>
          Seafoam will be available in the Seasonal Shop until July 31st!
        </p>
        <div class="small mb-3">by Lemoness</div>
      </div>
      `,
    });
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Allow latest Bailey announcement to be read later
 * @apiName TellMeLaterNews
 * @apiDescription Add a notification to allow viewing of the latest "New Stuff by Bailey" message.
 * Prevent this specific Bailey message from appearing automatically.
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
