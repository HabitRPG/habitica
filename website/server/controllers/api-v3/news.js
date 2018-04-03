import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'BACKGROUNDS, ARMOIRE ITEMS, AND OFFICIAL CHALLENGES FOR APRIL';
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
        <h2>4/2/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>April Backgrounds and Armoire Items!</h3>
            <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can fly over an Ancient Forest, soar above a Field of Wildflowers, and dally in a pretty Tulip Garden. Check them out under User Icon > Backgrounds!</p>
            <p>Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including some fun joke props in honor of April Fool's Day! Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
            <div class="small mb-3">by BanthaFett, Podcod, virginiamoon, Vikte and Kiwibot</div>
            <h3>April 2018 Resolution Success Challenge and Take This Challenge</h3>
            <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/1db268f0-9be3-4f34-9c68-ae63b3a4c7d4' target='_blank'>Rally Your Allies</a>, we're focusing on building accountability by reaching out to supportive people in your life ! It has a 15 gem prize, which will be awarded to five lucky winners on May 1st.</p>
            <p>Congratulations to the winners of March's Challenge, LuxInWonderland, kheftel, Midnight Reverie, bookishninja, and VeganValerie!</p>
          </div>
          <div class="promo_armoire_background_201804 ml-3"></div>
        </div>
        <div class="scene_positivity center-block"></div>
        <p>The next Take This Challenge has also launched, "<a href='/challenges/f817901f-86eb-4bbd-afd9-d3e2396d9ae5' target='_blank'>Test Thy Courage!</a>, with a focus on initiating positive social interactions. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
        <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
        <p>Congratulations to the winners of the last Take This Challenge, "I Am the Night!": grand prize winner Jon Johnson, and runners-up valosin, ninaninet, awcward, Jackie Stack, and SaphirSoleil. Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they didn't have the full set already. It is located in your Rewards column. Enjoy!</p>
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
