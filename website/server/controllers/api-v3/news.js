import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW BACKGROUNDS AND ARMOIRE ITEMS! PLUS, SPOOKY SPARKLES IN THE SEASONAL SHOP!';
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
            <h2>10/1/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_armoire_backgrounds_202010 center-block"></div>
        <h3>October Backgrounds and Armoire Items!</h3>
        <p>
          We’ve added three new backgrounds to the Background Shop! Now your avatar can dare to
          visit a Haunted Forest, brave the Spooky Scarecrow Field, or bask in the glow of the
          Crescent Moon. Check them out under User Icon > Backgrounds on web and Menu > Inventory >
          Customize Avatar on mobile!
        </p>
        <p>
          Plus, there’s new Gold-purchasable equipment in the Enchanted Armoire, including the
          Autumn Enchanter Set. Better work hard on your real-life tasks to earn all the pieces!
          Enjoy :)
        </p>
        <div class="small mb-3">by AnnDeLune and SabreCat</div>
        <div class="promo_spooky_sparkles center-block"></div>
        <h3>Spooky Sparkles in Seasonal Shop</h3>
        <p>
          There's a new Gold-purchasable item in the <a href='/shops/seasonal'>Seasonal Shop</a>:
          Spooky Sparkles! Buy some and then cast it on your friends. I wonder what it will do?
        </p>
        <p>
          If you have Spooky Sparkles cast on you, you will receive the "Alarming Friends" badge!
          Don't worry, any mysterious effects will wear off the next day.... or you can cancel them
          early by buying an Opaque Potion!
        </p>
        <p>
          While you're at it, be sure to check out all the other items in the Seasonal Shop! There
          are lots of equipment items from the previous Fall Festivals. The Seasonal Shop will only
          be open until October 31st, so stock up now.
        </p>
        <div class="small mb-3">by Lemoness and SabreCat</div>
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
