import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW BACKGROUNDS, ARMOIRE ITEMS, RESOLUTION SUCCESS CHALLENGE, AND TAKE THIS CHALLENGE';
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
        <h2>3/1/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media">
          <div class="media-body">
            <h3>March Backgrounds and Armoire Items!</h3>
            <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can enjoy Driving a Coach, relax on an Elegant Balcony, and explore a Gorgeous Greenhouse. Check them out under User Icon > Backgrounds!</p>
            <p>Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including the Fluttery Frock Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
            <div class="small mb-3">by AnnDeLune, Nummycakes, Reesachan, DialFforFunky, Vampitch, and RandomGryffindor</div>
            <div class="media align-items-center">
              <div class="scene_achievement mr-3"></div>
              <div class="media-body">
                <h3>March 2018 Resolution Success Challenge and New Take This Challenge</h3>
                <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New Year's Resolution Guild</a>!</p>
              </div>
            </div>
          </div>
          <div class="promo_armoire_background_201803 ml-3"></div>
        </div>
        <p>These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/aa12f4d3-4c3f-4f5c-ab27-9cb01dd9939f' target='_blank'>Reach for Your First Achievement</a>, we're focusing on celebrating your progress so far and looking ahead! It has a 15 gem prize, which will be awarded to five lucky winners on April 2nd.</p>
        <p>Congratulations to the winners of February's Challenge: angelaBelacqua, Birgitte, letsleepingmonsterslie, FlyingRhino, and Dani!</p>
        <p>The next Take This Challenge has also launched, "<a href='/challenges/15566a6e-abc1-476c-b208-7577cf45b794' target='_blank'>I Am the Night!</a>", with a focus on sleep hygiene. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
        <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
        <p>Congratulations to the winners of the last Take This Challenge, "Cast of Characters!": grand prize winner lovinglyquietcat, and runners-up Hannah, Chrys, CTBG_R0X, lucas br, and Tarashiko! Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they hadn't completed the set already. It is located in your Rewards column. Enjoy!</p>
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
