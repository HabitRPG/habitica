import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW PET ACHIEVEMENT AND QUEST BUNDLE!';
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
            <h2>5/14/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="achievement-bareNecessities2x center-block"></div>
        <h3>New Quest Pet Badge!</h3>
        <p>
          We're releasing a new achievement so you can celebrate your successes in the world of
          Habitican Pet collecting! Earn the Bare Necessities achievement by collecting all
          Habitica's jungle-dwelling Pets and you'll earn a nifty badge for your profile.
        </p>
        <p>
          If you’ve already completed the required Quests for a newly released achievement, you
          don’t have to do them all again! Just complete one of the relevant Quests and the
          Achievement will unlock. Check your profile and celebrate your new Achievement with
          pride.
        </p>
        <div class="small mb-3">by Beffymaroo and SabreCat</div>
        <div class="promo_jungle_buddies_bundle center-block"></div>
        <h3>New Discounted Pet Quest Bundle: Jungle Buddies!</h3>
        <p>
          If you're eager to complete the Bare Necessities quests, or if you're simply looking to
          add some equatorial pets to your Habitica stable, you're in luck! From now until May 30,
          you can purchase the Jungle Buddies Pet Quest Bundle and receive the Monkey, Sloth, and
          Treeling quests, all for only 7 Gems! That's a discount of 5 Gems from the price of
          purchasing them separately. Check it out in the <a href='/shops/quests'>Quest Shop</a>
          today!
        </p>
        <div class="small">by SabreCat</div>
        <div class="small">Writing by PixelHunter, Emily Austin, Flutter Bee, and Felipe NA</div>
        <div class="small mb-3">
          Art by JaizakAripaik, Drevian, McCoyly, awakebyjava, PainterProphet, Kiwibot,
          greenpencil, fuzzytrees, PainterProphet, aurakami, yamato, leephon, Misceo, and
          Oneironaut
        </div>
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
