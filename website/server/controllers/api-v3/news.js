import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW BACKGROUNDS, ARMOIRE ITEMS, AND OFFICIAL HABITICA CHALLENGES!';
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
            <h2>10/1/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_armoire_backgrounds_201910 center-block"></div>
        <h3>October Backgrounds and Armoire Items!</h3>
        <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can experiment in a Monster Maker's Workshop, ride in a magical Pumpkin Carriage, and journey across a Foggy Moor. Check them out under User Icon > Backgrounds!</p>
        <p>Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including the Shadow Master Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
        <div class="small mb-3">by GeraldThePixel, QuartzFox, Tigergurke, Vikte, Daikagaru, and SabreCat</div>
        <div class="scene_strength center-block"></div>
        <h3>October 2019 Resolution Success Challenge and New Take This Challenge</h3>
        <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99'>Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/ef1f7844-a58a-48f8-aab0-0423ff67ffa2'>Staying Strong</a>, we're focusing on boosting your motivation heading into the final quarter of the year! It has a 15 Gem prize, which will be awarded to five lucky winners on November 1st.</p>
        <p>Congratulations to the winners of the September Challenge: Inkblots, Betelgeuse_aOri, timohi, IceBlueMelody, and han-!</p>
        <p>The next Take This Challenge has also launched, "<a href='/challenges/23f6f7b7-fcf5-46a2-b591-aae05d3e62fe'>Check Your HP!</a>", with a focus on tracking your mood over time. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
        <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
        <p>Congratulations to the winners of the last Take This Challenge, "It's Dangerous to Go Alone!": grand prize winner @Ukioye_Kana, and runners-up @TheReptilianCave, @Merilio, @DocBajillian, @Melodyheart, and @Melanchoii! Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they hadn't completed it already. It is located in your Rewards column.</p> Enjoy!
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat</div>
        <div class="promo_take_this center-block"></div>
        <h3>Back-to-School Preparation Challenge Winners</h3>
        <p>The winners of the Habitica Back-to-School Preparation Challenge have been selected! Congratulations to: gils__, talklesssmilemore, Nadoko, pigmaniac1941, and French1Fry !</p>
        <p>Thank you to everyone who participated! We're excited to help you pursue your goals through the new school year and beyond!</p>
        <div class="small mb-3">by Beffymaroo and SabreCat</div>
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
