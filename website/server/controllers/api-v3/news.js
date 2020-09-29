import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR SEPTEMBER DEALS! FALL AVATAR CUSTOMIZATIONS! COSTUME CHALLENGE!';
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
            <h2>9/29/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_202009 center-block"></div>
        <h3>Last Chance for Marvelous Moth Set</h3>
        <p>
          Reminder: this is the last day to receive the Marvelous Moth Set when you <a
          href='/user/settings/subscription'>sign up for a new Habitica subscription</a>!
          Subscribing also lets you buy Gems with Gold. The longer your subscription, the more Gems
          you can get!
        </p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <h3>Last Chance to Get In On the Fall Gem Sale!</h3>
        <p>
          Don't forget, our special Fall Gem Sale ends on Sept 30. Bonus Gems are included with
          every Gem purchase until the sale ends. Be sure to stock up now so you have plenty of
          Gems for Gala goodies, Quests, and more!
        </p>
        <div class="promo_fall_customizations center-block"></div>
        <h3>Supernatural Skins and Haunted Hair Colors</h3>
        <p>
          The Seasonal Edition Haunted Hair Colors are now available for purchase! Now you can dye
          your avatar's hair Pumpkin, Midnight, Candy Corn, Ghost White, Zombie, or Halloween. Get
          them before October 31st!
        </p>
        <p>
          The Supernatural Skin Set is also available until October 31st! Now your avatar can
          become an Ogre, Skeleton, Pumpkin, Candy Corn, Reptile, or Dread Shade.
        </p>
        <p>
          Seasonal Edition items recur unchanged every year, but they are only available to
          purchase during a short period of time. Find these exciting skins and hair colors in Menu
          > Customize Avatar. Get them now, or you'll have to wait until next year!
        </p>
        <div class="small mb-3">by Lemoness, mariahm, and crystalphoenix</div>
        <div class="achievement-costumeContest2x center-block"></div>
        <h3>Official Habitica Costume Challenge!</h3>
        <p>
          The Community Costume Challenge has begun! Between now and October 31st, dress up as your
          avatar in real life and post a photo on social media to get the coveted Costume Challenge
          badge and a chance to be featured on Habitica's social media accounts! Read the full
          rules on <a href='/challenges/39539048-3cf0-4e65-bb05-c8294a64eed3'>the Challenge page</a>.
        </p>
        <div class="small mb-3">by Beffymaroo</div>
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
