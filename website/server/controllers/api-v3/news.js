import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW BACKGROUNDS AND ARMOIRE ITEMS, MONTHLY CHALLENGES, AND SHINY SEEDS';
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
            <h2>4/2/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_armoire_backgrounds_201904 center-block"></div>
        <h3>April Backgrounds and Armoire Items</h3>
        <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can visit a Halfling's House, dally through a peaceful Birch Forest, and take in the Superbloom in the Blossoming Desert. Check them out under User Icon > Backgrounds!</p>
        <p>Plus, there’s new Gold-purchasable equipment in the Enchanted Armoire, including some fun joke props in honor of April Fool's Day! Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
        <div class="small mb-3">by Vikte, QuartzFox, Katy133, GeraldThePixel, and Gully</div>
        <div class="scene_hat_guild center-block"></div>
        <h3>April 2019 Resolution Success Challenge and New Take This Challenge</h3>
        <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/ae4a6ab8-e4c7-46fb-ba48-a5f05610a55d'>Gather Your Party</a>, we're focusing on finding encouraging allies to help you gain accountability for your goals! It has a 15 Gem prize, which will be awarded to five lucky winners on May 1st.</p>
        <p>Congratulations to the winners of March's Challenge, DcryptMart, LONEW0LF, Elcaracol, DungeonMasterful, and 7NationTpr!</p>
        <div class="promo_take_this center-block"></div>
        <p>The next Take This Challenge has also launched, "<a href='/challenges/5712376e-89f1-4f8b-89eb-8f94026d0da9'>Harder, Faster, Stronger!</a>", with a focus on setting and meeting physical activity goals. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
        <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
        <p>Congratulations to the winners of the last Take This Challenge, "Do One Thing Well!": grand prize winner Денис Кадников, and runners-up addone, alihenri, Hemogoblin3991, Kalu_Ienvru, and gabriellamara! Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they hadn't completed it already. It is located in your Rewards column. Enjoy!</p>
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat</div>
        <div class="promo_shiny_seeds center-block"></div>
        <h3>Shiny Seeds</h3>
        <p>Throw a Shiny Seed at your friends and they will turn into a cheerful flower until their next cron! You can buy the Seeds in the <a href='/shops/seasonal'>Seasonal Shop</a> for Gold. Plus, if you get transformed by a Shiny Seed, you'll receive the Agricultural Friends badge!</p>
        <p>Don't want to be a flower? Just buy some Petal-Free Potion from your Rewards column to reverse it.</p>
        <p>Shiny Seeds will be available in the <a href='/shops/seasonal'>Seasonal Shop</a> until April 30th!</p>
        <div class="small mb-3">by Lemoness</div>
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
