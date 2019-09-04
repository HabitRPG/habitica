import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA OFFICIAL CHALLENGES, NEW BACKGROUNDS, NEW ARMOIRE ITEMS';
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
            <h2>9/3/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="scene_medal center-block"></div>
        <h3>September 2019 Resolution Success Challenge and New Take This Challenge</h3>
        <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/375de4a2-1050-4886-8eaf-1de25ed2ee02'>Celebrate Your Triumphs</a>, we're focusing on celebrating your positive outcomes so far! It has a 15 Gem prize, which will be awarded to five lucky winners on October 1st.</p>
        <p>Congratulations to the winners of August's Challenge, @rcgwriter, @silverivy, @dontanticipate, @Namida2u, and @Frowldrees!</p>
        <div class="promo_take_this center-block"></div>
      <p>The next Take This Challenge has also launched, "<a href='/challenges/41b9de95-67aa-4609-a4b9-216c3c613018'>It's Dangerous to Go Alone!</a>", with a focus on strengthening social connections. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
        <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
        <p>Congratulations to the winners of the last Take This Challenge, "Enter Sandman!": grand prize winner Weatherwax (@Weatherwax1), and runners-up TacoDanger (@hb-3b58tnlhnzgixkj49), Mis (@Ellaiyn), @GodofTroll, @ellie_ivanova, and @agateAngel! Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they hadn't completed it already. It is located in your Rewards column. Enjoy!</p>
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat</div>
        <div class="promo_armoire_backgrounds_201909 center-block"></div>
        <h3>September Backgrounds and Armoire Items</h3>
        <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can take in the warmth of an Autumn Flower Garden, brave the mysteries of an Ancient Tomb, and absorb knowledge in a Classroom. Check them out under User Icon > Backgrounds!</p>
        <p>Plus, there’s new Gold-purchasable equipment in the Enchanted Armoire, including the Florid Fan, a Polished Pocketwatch, and a Resplendent Rapier. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
        <div class="small mb-3">by Vikte, aspiring_advocate, Tigergurke, AnnDeLune, Katy133, ravenlune, QuartzFox, and GeraldThePixel.</div>
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
