import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'CUDDLE BUDDIES QUEST BUNDLE AND TIPS FOR PARTY MOTIVATION';
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
          <div class="media-body">
            <div class="media">
              <div class="align-self-center mr-3 ${baileyClass}"></div>
              <div class="media-body">
                <h1 class="align-self-center">${res.t('newStuff')}</h1>
              </div>
            </div>
            <h2>5/8/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
            <hr/>
            <h3>New Discounted Pet Quest Bundle: Cuddle Buddies!</h3>
            <p>If you are looking to add some pets to your Habitica stable, you're in luck! From now until 31-May, you can purchase the Cuddle Buddies Pet Quest Bundle and receive the Bunny, Ferret, and Guinea Pig quests, all for only 7 Gems! That's a discount of 5 Gems from the price of purchasing them separately. Check it out in the <a href="/shops/quests" target="_blank">Quest Shop</a> today!</p>
            <div class="small">by Beffymaroo and SabreCat</div>
            <div class="small">Art by Willow the Witty, mewrose, Stefalupagus, Pandah, UncommonCriminal, Gully, Draayder, Teto Forever, PainterProphet, Beffymaroo, Faye, RBrinks, Pocketmole, and James Danger</div>
            <div class="small mb-3">Writing by Lilith of Alfheim, Teto Forever, and Bartelmy</div>
          </div>
          <div class="promo_bundle_cuddleBuddies ml-3"></div>
        </div>
        <div class="media align-items-center">
          <div class="scene_casting_spells mr-3 mb-3"></div>
          <div class="media-body">
            <h3>Blog Post: Keeping Parties Motivated</h3>
            <p>Did you catch our latest <a href="https://habitica.wordpress.com/2018/04/25/keeping-parties-motivated/" target="_blank">featured Wiki article</a>? It's about Keeping Parties Motivated! We hope that it will help you as you battle Habitica's bosses and your tasks with your friends. Be sure to check it out, and let us know what you think by reaching out on <a href="https://twitter.com/habitica" target="_blank">Twitter</a>, <a href="http://blog.habitrpg.com" target="_blank">Tumblr</a>, and <a href="https://facebook.com/habitica" target="_blank">Facebook</a>.</p>
            <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
          </div>
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
  middlewares: [authWithHeaders({
    userFieldsToExclude: ['inbox'],
  })],
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
