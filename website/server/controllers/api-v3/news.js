import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'ALL THE CHALLENGES! NEWS ON RESOLUTION SUCCESS, TAKE THIS, BACK-TO-SCHOOL, AND COSTUME CHALLENGES';
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
            <h2>10/02/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>October 2018 Resolution Success Challenge</h3>
        <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/34bc427f-f0ff-469e-b0f0-7225d40ba679' target='_blank'>Staying Strong</a>, we're focusing on keeping up your motivation as we reach the end of the year! It has a 15 Gem prize, which will be awarded to five lucky winners on November 1st.</p>
        <p>Congratulations to the winners of the September Challenge: RubberSoul, KateMomster, 0xymore, Sindyr, and IceBlueMelody!</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>New Take This Challenge</h3>
            <p>The next Take This Challenge has also launched, "<a href='/challenges/3ae1d8e3-1cc1-4e70-86a2-f735692aad6e' target='_blank'>+2 Intelligence Bonus!</a>", with a focus on deep learning about a topic of interest. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
          </div>
          <div class="promo_take_this ml-3"></div>
        </div>
        <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
        <p>Congratulations to the winners of the last Take This Challenge, "Gaining Inspiration Points!": grand prize winner Wehna, and runners-up Sikk Jones the Rogue, Archangel, Tally, Micha The Seer, and Eeveelee! Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they hadn't completed it already. It is located in your Rewards column. Enjoy!</p>
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, and SabreCat</div>
        <h3>Back-to-School Preparation Challenge Winners</h3>
        <p>The winners of the Habitica Back-to-School Preparation Challenge have been selected! Congratulations to: Hanieh S, MXD, boknoy4, zyf32123, and MotThePaladin!</p>
        <p>Thank you to everyone who participated! We're excited to help you pursue your goals through the new school year and beyond!</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="media align-items-center">
          <div class="achievement-costumeContest6x mr-3"></div>
          <div class="media-body">
            <h3>Costume Challenge</h3>
            <p>The Community Costume Challenge has begun! Between now and October 31st, dress up as your avatar in real life and post a photo on social media to get the coveted Costume Challenge badge and a chance to be featured in Habitica Cosplay Friday on our <a href='http://blog.habitrpg.com/tagged/cosplay' target='_blank'>Tumblr</a> or <a href='https://www.instagram.com/habitica/' target='_blank'>Instagram</a>! Read the full rules <a href='/challenges/9b037979-b9b6-453a-9343-8fc224faa47e' target='_blank'>on the Challenge page</a>.</p>
            <div class="small mb-3">by Beffymaroo</div>
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
