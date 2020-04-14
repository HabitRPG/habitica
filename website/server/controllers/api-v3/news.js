import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'CONFECTION HATCHING POTION QUEST, APRIL FOOL BLOG POST, AND SHINY SEEDS!';
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
            <h2>4/7/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>April Fool's Challenge Winners and Blog Post!</h3>
        <p>
          The winners of the April Fool's Social Media Challenge have been selected!
          Congratulations to Silvercat17, RaidingPartyGames, Pangdood, Spacehawk, and VixiMonster!
        </p>
        <p>
          Thank you to everyone who shared their awesome pics with their dessert pets! You can see
          a fun <a href='https://habitica.wordpress.com/2020/04/07/taking-the-cake-dessert-pet-pics-from-habiticas-april-fools-celebration/'
          target='_blank'>recap of the shenanigans on our blog</a>. Stay tuned to see what wacky antics the Fool gets up to next year!
        </p>
        <div class="promo_april_fools_2020 center-block"></div>
        <h3>Confection Magic Hatching Potion Quest!</h3>
        <p>
          Oh, no! Just as Habiticans were going back to daily life, missing their cute dessert
          pets, it looks like some kind of syrupy monstrosity has emerged to threaten the land!
        </p>
        <p>
          Can you help the April Fool save Habitica from the Awful Waffle? Join the battle, and
          earn special Confection Magic Hatching potions by completing your everyday tasks.
        </p>
        <p>
          You can purchase the limited Confection Magic Hatching Potion Quest from the <a
          href='/shops/quests'>Quest Shop</a> between now and April 30! Each quest completion
          awards participants three potions each. Confection pets do not have mount forms, so keep
          that in mind when you're purchasing!
        </p>
        <p>
          Garden Potions have also returned, if you prefer a healthier treat! You can find them in
          <a href='/shops/market'>the Market</a> until April 30. Keep in mind that Garden pets also
          do not have mount forms when deciding how many to purchase.
        </p>
        <p>
          After they're gone, it will be at least a year before the Confection Magic Hatching
          Potion Quest or the Garden Magic Potions are available again, so be sure to get them now!
        </p>
        <div class="small mb-3">by Beffymaroo, Piyo, Viirus, and SabreCat</div>
        <div class="promo_shiny_seeds center-block"></div>
        <h3>Shiny Seeds</h3>
        <p>
          Throw a Shiny Seed at your friends and they will turn into a cheerful flower until their
          next cron! You can buy the Seeds in the <a href='/shops/seasonal'>Seasonal Shop</a> with
          Gold. Plus, if you get transformed by a Shiny Seed, you'll receive the Agricultural
          Friends badge!
        </p>
        <p>
          Don't want to be a flower? Just buy some Petal-Free Potion from your Rewards column to
          reverse it.
        </p>
        <p>
          Shiny Seeds will be available in the <a href='/shops/seasonal'>Seasonal Shop</a> until
          April 30th!
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
