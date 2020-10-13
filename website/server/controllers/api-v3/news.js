import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW DISCOUNTED PET QUEST BUNDLE: SANDY SIDEKICKS!';
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
            <h2>10/13/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_sandy_sidekicks_bundle center-block"></div>
        <p>
          If you are looking to add some desert-dwelling pets to your Habitica stable, you're in
          luck! From now until Oct 31, you can purchase the Sandy Sidekicks Pet Quest Bundle and
          receive the Spider, Snake, and Armadillo quests, all for only 7 Gems! That's a discount
          of 5 Gems from the price of purchasing them separately. Check it out in the <a
          href='/shops/quests'>Quest Shop</a> today!
        </p>
        <div class="small">by SabreCat</div>
        <div class="small">
          Art by: Beffymaroo, starsystemic, PainterProphet, krajzega, Tipsy, Arcosine, Eevachu,
          RBrinks, Darkly, UncommonCriminal, and EmeraldOx
        </div>
        <div class="small mb-3">Writing by: emiausti, Arcosine, felipena, and Daniel the Bard</div>
        <p>
          If snakes and/or spiders are something you'd prefer not to see in Habitica due to a
          phobia, check out the <a
          href='http://habitica.wikia.com/wiki/Phobia_Protection_Extension' target='_blank'>Phobia
          Protection Extension</a> which will hide any pets, mounts, backgrounds, quest bosses, or
          equipment featuring snakes and/or spiders (as well as rats, bees, beetles, zombies,
          skeletons, moths, or any combination thereof). We hope that it helps make everyone's
          Habitica experience fun!
        </p>
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
