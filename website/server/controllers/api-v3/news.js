import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW DINOSAUR PET QUEST BUNDLE AND WIKI SPOTLIGHT';
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
            <h2>11/14/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_delightful_dinos center-block"></div>
        <h3>New Pet Quest Bundle: Delightful Dinos</h3>
        <p>
          If you are looking to add some dinosaur pets to your Habitica stable, life, uh, finds a
          way! From now until November 30, you can purchase the Delightful Dinos Pet Quest Bundle
          and receive the Pterodactyl, Triceratops, and T-Rex (The Dinosaur Unearthed) quests, all
          for only 7 Gems! That's a discount of 5 Gems from the price of purchasing them
          separately. Check it out in the <a href='/shops/quests'>Quest Shop</a> today!
        </p>
        <div class="small">by SabreCat and Beffymaroo</div>
        <div class="small">Art by Baconsaur, Eevachu, UncommonCriminal, Kiwibot, McCoyly,
          plumilla, Seraphina, PainterProphet, Stefalupagus, Katy133, Edge, Willow The Witty,
          Lilith of Alfheim, Procyon, GeraldThePixel, and Archeia
        </div>
        <div class="small mb-3">Writing by Lemoness, Daniel the Bard, Lilith of Alfheim, and Ali
          Stewart
        </div>
        <div class="scene_habitica_map center-block"></div>
        <h3>Blog Post: Places in Habitica</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/11/14/places-in-habitica/'
          target='_blank'>featured Wiki article</a> is about Places in Habitica! We hope that it
          will help you as you gamify your tasks. Be sure to check it out, and let us know what 
          you think by reaching out on <a href='https://twitter.com/habitica'
          target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com'
          target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica'
          target='_blank'>Facebook</a>.
        </p>
        <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
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
