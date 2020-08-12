import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'BACK TO SCHOOL CHALLENGE, NEW BACKGROUNDS, AND NEW ENCHANTED ARMOIRE ITEMS!';
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
            <h2>8/11/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="scene_reading center-block"></div>
        <h3>Official Habitica Challenge: Back-to-School Preparation!</h3>
        <p>
          The school year is looming large for many scholarly Habiticans, so we've prepared a
          special <a href='/challenges/8d6e280a-4dc8-4957-b2b4-feb07ce9ff6b'>Back-to-School
          Challenge</a> to help with the transition between summer and semester. Check it out now
          for a chance to win: five lucky winners will get a badge for their profile and their
          choice of a <a href='https://habitica.wikia.com/wiki/Subscription'
          target='_blank'>gift subscription</a> or Gems!
        </p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_armoire_backgrounds_202008 center-block"></div>
        <h3>August Backgrounds and Armoire Items!</h3>
        <p>
          We’ve added three new backgrounds to the Background Shop! Now your avatar can stroll
          through Habit City's Productivity Plaza, enjoy the outdoors by Camping Out, or bask in
          the splendor of the Jungle Canopy. Check them out under User Icon > Backgrounds on web
          and Menu > Inventory > Customize Avatar on mobile!
        </p>
        <p>
          Plus, there’s new Gold-purchasable equipment in the Enchanted Armoire, including the
          Heroic Herbalist Set. Better work hard on your real-life tasks to earn all the pieces!
          Enjoy :)
        </p>
        <div class="small mb-3">
          by AnnDeLune, katieslug, Alonquain,-Tyr-, OuttaMyMind, shanaqui and SabreCat
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
