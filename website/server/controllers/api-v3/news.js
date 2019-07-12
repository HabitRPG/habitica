import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SPLASHY SKINS, BACKGROUNDS, ARMOIRE ITEMS, AND BLOG POST';
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
            <h2>7/2/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_splashy_skins center-block"></div>
        <h3>Splashy Skins</h3>
        <p>The Seasonal Edition Splashy Skins are back! You can complete your summer avatar look with Clownfish, Deep Ocean, Tropical Water, Mergold, Mergreen, Merblue, Merruby, and Shark Skins.</p>
        <p>This Seasonal Edition customization set will only be available to purchase until July 31st, after which they'll be gone until next year, so be sure to swoop them up now! You can find them in User>Edit Avatar!</p>
        <div class="small mb-3">by Lemoness and UncommonCriminal</div>
        <div class="promo_armoire_backgrounds_201907 center-block"></div>
        <h3>July Backgrounds and Armoire Items</h3>
        <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can enjoy the view while Flying Over Tropical Islands, explore reef life Among Giant Anemones, and stargaze on a Lake with Floating Lanterns. Check them out under User Icon > Backgrounds!</p>
        <p>Plus, there’s new Gold-purchasable equipment in the Enchanted Armoire, including the Astronomer Mage set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
        <div class="small mb-3">by Tashus, Tigergurke, Vikte, QuartzFox, Gully, Swazzy, and SabreCat</div>
        <div class="scene_casting_spells center-block"></div>
        <h3>Blog Post: Warrior</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2019/06/26/warrior/' target='_blank'>featured Wiki article</a> is about the Warrior class! We hope that it will help you as you explore the advantages of each class. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
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
