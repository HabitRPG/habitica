import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'APRIL FOOLS CHALLENGE WINNERS, GARDEN HATCHING POTIONS, AND SPRING AVATAR CUSTOMIZATIONS';
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
            <h2>4/9/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>April Fool's Challenge Winners and Blog Post!</h3>
        <p>The winners of the April Fool's Social Media Challenge have been selected! Congratulations to: isaaleonardo, Bee_, kitt-haven, alittleofeverything, and Zelah_Meyer!</p>
        <p>Thank you to everyone who shared their awesome pics with their fruit and veggie pets! You can see a fun <a href='https://habitica.wordpress.com/2019/04/09/guac-this-way-fruit-and-veggie-pet-pics-from-habiticas-april-fools-celebration/' target='_blank'>recap of the shenanigans on our blog</a>. Stay tuned to see what wacky antics the Fool gets up to next year!</p>
        <div class="promo_april_fools_2019 center-block"></div>
        <h3>Garden Magic Hatching Potions</h3>
        <p>The April Fool returns to the Tavern, wearing his trademarked mischievious grin and pulling a wagon whose contents are covered with a colorful cloth.</p>
        <p>"I'm so glad everyone enjoyed my <strong>wholesome</strong> joke!" he declares, tossing confetti in the air as he often does. "Since you all had so much fun, I've brought you another surprise!"</p>
        <p>He dramatically pulls away the cloth to reveal that the wagon is filled with potion bottles! Each bottle seems to contain a shape-shifting vegetable.</p>
        <p>"Now you can keep your fruit and veggie pets all year round!" he says. "Take good care of them, and I'll see you all again soon. I guess I've really outdone myself so I have some serious planning to do before next year..." With that, the Fool takes his leave, disappearing in a puff of lettuce leaves and leaving the cart full of potions.</p>
        <p>Thanks to the April Fool, you can purchase Garden Magic Hatching Potions in the Market between now and April 30! Garden pets do not have mount forms (yet!) so keep that in mind when you're purchasing. After they're gone, it will be at least a year before Garden Magic Potions are available again, so be sure to get them now!</p>
        <div class="small mb-3">by Beffymaroo, Piyo, and SabreCat</div>
        <div class="promo_spring_avatar_customizations center-block"></div>
        <h3>Shimmer Hair Colors and Pastel Skin Set</h3>
        <p>The Seasonal Edition Shimmer Hair Colors and Pastel Skin Set are now available for purchase in the User > Edit Avatar! These skin sets will only be available to purchase until April 30th, and then they will disappear from the shop until next Spring Fling. If you buy them, though, you will have access to them year-round!</p>
        <div class="small mb-3">by Lemoness and McCoyly</div>
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
