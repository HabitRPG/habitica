import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'FEBRUARY RESOLUTION SUCCESS CHALLENGE AND NEW TAKE THIS CHALLENGE';
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
            <h2>2/4/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="scene_yesterdailies center-block"></div>
        <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/03498939-08f2-49dc-af77-1c891525f22d'>Hone Your Weapons</a>, we're focusing on refining and narrowing down your goals to make them more achievable! It has a 15 Gem prize, which will be awarded to five lucky winners on March 1st.</p>
        <p>Congratulations to the winners of January's Challenge, RainbowZebra27, Annobethal, Pheonix_Heart, rachalza, and grimreader!</p>
        <p>The next Take This Challenge has also launched, "<a href='/challenges/f0828ccc-f567-47ab-9c22-18c335c9cad9'>Achievement Unlocked: Self-Care!</a>", with a focus on tending to the energy reserves we use when helping others. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
        <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
        <p>Congratulations to the winners of the last Take This Challenge, "Feed Me, Seymour!": grand prize winner _andrey, and runners-up Comebach, FoxInABoxPls, chadm73, creadeliefje, and NTScott! Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they hadn't completed it already. It is located in your Rewards column. Enjoy!</p>
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat</div>
        <div class="promo_take_this center-block"></div>
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
