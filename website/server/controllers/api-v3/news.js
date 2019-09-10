import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW DISCOUNTED PET QUEST BUNDLE: ROCKING REPTILES';
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
            <h2>9/10/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_rocking_reptiles_bundle center-block"></div>
        <p>If you're looking to add some scaly friends to your Habitica stable, you're in luck! From now until Sept 30, you can purchase the Rocking Reptiles Pet Quest Bundle and receive the Alligator, Snake, and Velociraptor quests, all for only 7 Gems! That's a discount of 5 Gems from the price of purchasing them separately. Check it out in the <a href='/shops/quests'>Quest Shop</a> today!</p>
        <div class="small">Art by Gully, Willow The Witty, mfonda, UncommonCriminal, tabbytoes, EmeraldOx, LordDarkly, PainterProphet, Seraphina, Anna Glassman, Procyon, and Lilith of Alfheim</div>
        <div class="small mb-3">Writing by Mike.Antonacci, lilackbar, Daniel The Bard, and felipena</div>
        <p>If snakes are something you'd prefer not to see in Habitica due to a phobia, check out the <a href='http://habitica.wikia.com/wiki/Phobia_Protection_Extension' target='_blank'>Phobia Protection Extension</a> which will hide any pets, mounts, backgrounds, quest bosses, or equipment featuring snakes (as well as spiders, rats, bees, zombies, skeletons, or any combination thereof). We hope that it helps make everyone's Habitica experience fun!</p>
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
