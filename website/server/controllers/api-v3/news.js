import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW BACKGROUNDS, ARMOIRE ITEMS, AND OFFICIAL HABITICA CHALLENGES FOR MAY';
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
        <h2>5/1/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media">
          <div class="media-body">
            <h3>New Backgrounds and Armoire Items</h3>
            <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can tiptoe through a Terraced Rice Field, bask in the glory of the Champions' Colosseum, and look for fun new footwear in the Fantastical Shoe Store. Check them out under User Icon > Backgrounds!</p>
            <p>Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including the Cobbler Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
            <div class="small mb-3">by Katy133, confusus, TheMushroomKing, khdarkwolf, RandomGryffindor, ChimeraLiani, and Mewrose</div>
            <div class="media align-items-center">
              <div class="scene_todos"></div>
              <div class="media-body">
                <h3>May 2018 Resolution Success Challenge and Take This Challenge</h3>
                <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/2c524717-699e-4fd6-acb6-dd868bf537dd' target='_blank'>Review your Combat Tactics</a>, we're focusing on refining your strategy to help you stay motivated and keep moving forward as we're almost halfway through the year! It has a 15 gem prize, which will be awarded to five lucky winners on June 1st.</p>
              </div>
            </div>
          </div>
          <div class="promo_armoire_backgrounds_201805 ml-3"></div>
        </div>
        <p>Congratulations to the winners of the April Challenge: V-Starr, Carlos Víquez, lilliburlero, NowyChris, and PizzaMyHeart!</p>
        <div class="media">
          <div class="media-body">
            <p>The next Take This Challenge has also launched, "<a href='/challenges/4ee6bb54-1c29-487b-a2de-07e6be24cccd' target='_blank'>Keep Calm and Carry On!</a>", with a focus on deep breathing to settle stressful emotions. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
            <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
          </div>
          <div class="promo_take_this"></div>
        </div>
        <p>Congratulations to the winners of the last Take This Challenge, "Test Thy Courage!": grand prize winner Nietos, and runners-up Teslectrik, Mflute, Kolthar, lilyandrosemary, and thewandererrae! Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they didn't have all the pieces already. It is located in your Rewards column. Enjoy!</p>
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat</div>
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
