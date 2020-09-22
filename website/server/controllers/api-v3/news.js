import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'FALL FESTIVAL BEGINS! NOW WITH A SALE ON GEMS!';
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
            <h2>9/22/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_fall_festival_2020 center-block"></div>
        <h3>Limited Edition Class Outfits</h3>
        <p>
          From now until October 31st, limited edition outfits are available in the Rewards column!
          Depending on your class, you can be a Wraith Warrior, Death's Head Moth Healer, Third Eye
          Mage, or Two-Headed Rogue. You'd better get productive to earn enough gold before your
          time runs out...
        </p>
        <div class="small mb-3">by Gawrone, Vikte, jjgame83, and SabreCat</div>
        <div class="promo_fall_festival_2019 center-block"></div>
        <h3>Seasonal Shop Opens</h3>
        <p>
          The <a href='/shops/seasonal'>Seasonal Shop</a> has opened! It's stocking autumnal
          Seasonal Edition goodies at the moment, including past fall outfits. Everything there
          will be available to purchase during the Fall Festival event each year, but it's only
          open until October 31st, so be sure to stock up now, or you'll have to wait a year to
          buy these items again!
        </p>
        <div class="small mb-3">
          by Gawrone, jjgame83, AnnDeLune, ʂʈєƒąʃųƥągųʂ, Katy133, Lilith of Alfheim, Definitely not
          a villain, ShoGirlGeek. cataclysms, maxpendragon, Vikte, QuartzFox, Lemoness, Beffymaroo
          and SabreCat
        </div>
        <div class="npc_justin center-block"></div>
        <p>
          Everyone has hastened down to the Flourishing Fields to celebrate this spooky harvest
          festival. Be sure to check out all the outfits that people are sporting!
        </p>
        <h3>Fall Gem Sale! September 22-30</h3>
        <p>
          For the first time ever, Habitica is offering a Gem sale to kick off the fun of Fall
          Festival! Receive bonus Gems with each Gem purchase on web or mobile - the more Gems you
          buy, the bigger the bonus! Use them to grab past Fall Festival Gear from the Seasonal
          Shop, Quests, Magic Hatching Potions, and more. Find more details via Menu > Gems on
          mobile, or tapping the Gem on the top menu bar on web.
        </p>
        <p>
          Be sure to update your mobile app to see details, although the promo will still work even
          if you can't see the promotional information.
        </p>
        <p>
          Thanks so much for your support. 💜 Gem purchases help keep us running ad-free!
        </p>
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
